using System.ComponentModel;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Models;
using LogAgentDemo.App.Services;
using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Tools;

// Narzędzie #2: wyszukiwanie wpisów poziomu ERROR.
//
// Model sięgnie po to narzędzie, gdy pytanie dotyczy błędów wprost
// ("jakie błędy wystąpiły?", "czy było coś na poziomie ERROR?").
// W przeciwieństwie do ReadLogFileTool, tutaj filtrowanie robi kod C#
// (LogEntryParser + LINQ), a nie model - to ważne z dwóch powodów:
// jest szybsze i deterministyczne (model nie "zgubi" żadnego wpisu).
public sealed class FindErrorEntriesTool(
    ILogFileReader fileReader,
    ILogEntryParser parser,
    AgentOptions options) : ILogAgentTool
{
    public AIFunction AsAIFunction() => AIFunctionFactory.Create(FindErrorEntries);

    [Description(
        "Wyszukuje w pliku logów wszystkie wpisy o poziomie ERROR i zwraca je " +
        "wraz z sygnaturą czasową. Użyj tego narzędzia, gdy pytanie dotyczy " +
        "błędów, awarii lub tego, co poszło nie tak w aplikacji.")]
    public async Task<string> FindErrorEntries(
        [Description("Maksymalna liczba zwracanych wpisów, licząc od najnowszych. Pomiń, aby zwrócić wszystkie.")]
        int? limit = null)
    {
        var lines = await fileReader.ReadLinesAsync(options.LogFilePath);
        var errors = parser.Parse(lines)
            .Where(e => e.Severity == LogSeverity.Error)
            .ToList();

        if (errors.Count == 0)
        {
            return "Nie znaleziono żadnych wpisów o poziomie ERROR w pliku logów.";
        }

        var selected = limit is > 0 ? errors.TakeLast(limit.Value) : errors;

        var formatted = selected.Select(e => $"[{e.Timestamp:yyyy-MM-dd HH:mm:ss}] {e.Message}");
        return $"Znaleziono {errors.Count} wpisów ERROR (pokazano {Math.Min(errors.Count, limit ?? errors.Count)}):{Environment.NewLine}" +
               string.Join(Environment.NewLine, formatted);
    }
}
