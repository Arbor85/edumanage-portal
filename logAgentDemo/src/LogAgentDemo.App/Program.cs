using LogAgentDemo.App.Agents;
using LogAgentDemo.App.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

// Punkt wejścia aplikacji: konfigurujemy kontener DI, wyciągamy z niego
// gotowego, w pełni "okablowanego" agenta i uruchamiamy prostą pętlę
// konsolową rozmowy z użytkownikiem.

var services = new ServiceCollection();

services.AddLogging(builder => builder
    .AddSimpleConsole(o => o.SingleLine = true)
    .SetMinimumLevel(LogLevel.Information));

// Wartości domyślne z AgentOptions wskazują na logs/app.log oraz lokalną
// Ollamę z modelem qwen3:8b - zmień je tutaj, jeśli chcesz użyć innego
// modelu lub innego pliku logów.
services.AddLogAgentServices(new AgentOptions());

await using var provider = services.BuildServiceProvider();
var agent = provider.GetRequiredService<LogAnalysisAgent>();

Console.WriteLine("=== Agent do analizy logów (Ctrl+C lub 'exit' aby zakończyć) ===");
Console.WriteLine("Przykładowe pytania: 'Czy wystąpiły jakieś wyjątki?', 'Jakie błędy pojawiały się najczęściej?'");
Console.WriteLine();

while (true)
{
    Console.Write("Ty: ");
    var input = Console.ReadLine();

    if (string.IsNullOrWhiteSpace(input) || input.Equals("exit", StringComparison.OrdinalIgnoreCase))
    {
        break;
    }

    try
    {
        var answer = await agent.AskAsync(input);
        Console.WriteLine();
        Console.WriteLine($"Agent: {answer}");
        Console.WriteLine();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Wystąpił błąd podczas rozmowy z agentem: {ex.Message}");
        Console.WriteLine("Upewnij się, że Ollama jest uruchomiona (polecenie: ollama serve) i model jest pobrany (ollama pull qwen3:8b).");
    }
}
