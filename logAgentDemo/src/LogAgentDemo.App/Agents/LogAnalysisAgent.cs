using LogAgentDemo.App.Prompts;
using LogAgentDemo.App.Services;
using LogAgentDemo.App.Tools;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace LogAgentDemo.App.Agents;

// TO JEST SERCE CAŁEGO PROJEKTU.
//
// Czym różni się "Agent" od zwykłego wywołania LLM?
// Zwykłe wywołanie LLM: pytanie -> model -> odpowiedź. Koniec.
// Agent: pytanie -> model DECYDUJE, czy potrzebuje danych z narzędzia ->
//        jeśli tak, MY wykonujemy to narzędzie -> wynik wraca do modelu ->
//        model widzi wynik i albo prosi o kolejne narzędzie, albo formułuje
//        ostateczną odpowiedź.
//
// To jest tzw. pętla ReAct (Reason + Act): model "rozumuje", jakiego
// narzędzia potrzebuje, "działa" wywołując je (a właściwie prosi nas o to),
// obserwuje wynik i powtarza ten cykl, aż uzna odpowiedź za kompletną.
//
// Poniższa implementacja robi to w pełni jawnie (bez "magicznej" biblioteki
// agentowej), żeby dokładnie widzieć każdy krok tej decyzji.
public sealed class LogAnalysisAgent
{
    // Zabezpieczenie przed nieskończoną pętlą, gdyby model w kółko prosił
    // o narzędzia i nigdy nie sformułował ostatecznej odpowiedzi.
    private const int MaxToolCallRounds = 5;

    private readonly IChatClient _chatClient;
    private readonly IConversationMemory _memory;
    private readonly IReadOnlyList<AIFunction> _availableTools;
    private readonly ILogger<LogAnalysisAgent> _logger;

    public LogAnalysisAgent(
        IChatClient chatClient,
        IConversationMemory memory,
        IEnumerable<ILogAgentTool> tools,
        ILogger<LogAnalysisAgent> logger)
    {
        _chatClient = chatClient;
        _memory = memory;
        _availableTools = tools.Select(t => t.AsAIFunction()).ToList();
        _logger = logger;

        _memory.SetSystemPrompt(SystemPrompts.LogAnalysisAgent);
    }

    public async Task<string> AskAsync(string userQuestion, CancellationToken cancellationToken = default)
    {
        _memory.AddUserMessage(userQuestion);

        var options = new ChatOptions
        {
            // Wystawiamy modelowi listę dostępnych narzędzi. To model - a nie
            // nasz kod - decyduje, którego (jeśli w ogóle) użyć, na podstawie
            // opisów [Description] zdefiniowanych przy każdej metodzie narzędzia.
            Tools = [.. _availableTools]
        };

        for (var round = 1; round <= MaxToolCallRounds; round++)
        {
            _logger.LogInformation("Runda {Round}: wysyłam zapytanie do modelu ({MessageCount} wiadomości w historii)",
                round, _memory.Messages.Count);

            var response = await _chatClient.GetResponseAsync(_memory.Messages, options, cancellationToken);

            // Odpowiedź modelu (w tym ewentualne "prośby o wywołanie narzędzia")
            // od razu trafia do pamięci - model musi widzieć własne wcześniejsze
            // kroki, żeby cała pętla miała sens w kolejnej rundzie.
            _memory.AddMessages(response.Messages);

            var functionCalls = response.Messages
                .SelectMany(m => m.Contents)
                .OfType<FunctionCallContent>()
                .ToList();

            if (functionCalls.Count == 0)
            {
                // Model nie poprosił o żadne narzędzie - uznajemy, że to jest
                // ostateczna odpowiedź dla użytkownika.
                _logger.LogInformation("Model zwrócił ostateczną odpowiedź bez wywołania narzędzi.");
                return response.Text;
            }

            _logger.LogInformation("Model zdecydował się wywołać {Count} narzędzi(-e): {Names}",
                functionCalls.Count, string.Join(", ", functionCalls.Select(f => f.Name)));

            foreach (var call in functionCalls)
            {
                var result = await InvokeToolAsync(call, cancellationToken);

                // Wynik narzędzia wraca do modelu jako specjalna wiadomość roli
                // "Tool", powiązana z konkretnym wywołaniem przez CallId -
                // dzięki temu model wie, który wynik odpowiada której prośbie.
                var resultContent = new FunctionResultContent(call.CallId, result);
                _memory.AddMessages([new ChatMessage(ChatRole.Tool, [resultContent])]);
            }
        }

        _logger.LogWarning("Osiągnięto limit {Limit} rund wywołań narzędzi bez ostatecznej odpowiedzi.", MaxToolCallRounds);
        return "Przepraszam, nie udało mi się sformułować odpowiedzi w rozsądnej liczbie kroków.";
    }

    private async Task<object?> InvokeToolAsync(FunctionCallContent call, CancellationToken cancellationToken)
    {
        var tool = _availableTools.FirstOrDefault(t => t.Name == call.Name);
        if (tool is null)
        {
            _logger.LogWarning("Model poprosił o nieznane narzędzie: {Name}", call.Name);
            return $"Błąd: narzędzie '{call.Name}' nie istnieje.";
        }

        _logger.LogInformation("Wywołuję narzędzie {Name} z argumentami: {Arguments}",
            call.Name, call.Arguments is null ? "(brak)" : string.Join(", ", call.Arguments.Select(a => $"{a.Key}={a.Value}")));

        try
        {
            var arguments = new AIFunctionArguments(call.Arguments);
            return await tool.InvokeAsync(arguments, cancellationToken);
        }
        catch (Exception ex)
        {
            // Błąd narzędzia nie powinien wysadzić całej rozmowy - odsyłamy
            // go do modelu jako wynik, żeby mógł np. poinformować użytkownika
            // albo spróbować innego podejścia.
            _logger.LogError(ex, "Narzędzie {Name} rzuciło wyjątkiem", call.Name);
            return $"Błąd podczas wywołania narzędzia '{call.Name}': {ex.Message}";
        }
    }
}
