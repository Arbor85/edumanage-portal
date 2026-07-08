using System.ComponentModel;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Services;
using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Tools;

// Narzędzie #3: wyszukiwanie wpisów wyglądających na wyjątki (Exception).
//
// Dlaczego to osobne narzędzie od FindErrorEntriesTool, skoro wyjątki
// też są logowane jako ERROR? Bo pytania użytkownika bywają precyzyjne
// ("czy wystąpiły wyjątki?" vs "jakie były błędy?") - dając modelowi
// osobne, węższe narzędzie, zwiększamy szansę, że wybierze właściwe
// i nie zaleje użytkownika nieistotnymi wpisami (np. HTTP 404, które
// też są ERROR, ale nie są wyjątkiem).
public sealed class FindExceptionEntriesTool(
    ILogFileReader fileReader,
    ILogEntryParser parser,
    AgentOptions options) : ILogAgentTool
{
    public AIFunction AsAIFunction() => AIFunctionFactory.Create(FindExceptionEntries);

    [Description(
        "Wyszukuje w pliku logów wpisy zawierające wyjątki (np. NullReferenceException, " +
        "SqlException, TimeoutException). Użyj tego narzędzia, gdy pytanie dotyczy " +
        "konkretnie wyjątków, a nie ogólnie błędów czy kodów HTTP.")]
    public async Task<string> FindExceptionEntries(
        [Description("Maksymalna liczba zwracanych wpisów, licząc od najnowszych. Pomiń, aby zwrócić wszystkie.")]
        int? limit = null)
    {
        var lines = await fileReader.ReadLinesAsync(options.LogFilePath);
        var exceptions = parser.Parse(lines)
            .Where(e => e.LooksLikeException)
            .ToList();

        if (exceptions.Count == 0)
        {
            return "Nie znaleziono żadnych wpisów zawierających wyjątki w pliku logów.";
        }

        var selected = limit is > 0 ? exceptions.TakeLast(limit.Value) : exceptions;

        var formatted = selected.Select(e => $"[{e.Timestamp:yyyy-MM-dd HH:mm:ss}] {e.Message}");
        return $"Znaleziono {exceptions.Count} wpisów z wyjątkami (pokazano {Math.Min(exceptions.Count, limit ?? exceptions.Count)}):{Environment.NewLine}" +
               string.Join(Environment.NewLine, formatted);
    }
}
