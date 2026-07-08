using System.Globalization;
using System.Text.RegularExpressions;
using LogAgentDemo.App.Models;

namespace LogAgentDemo.App.Services;

// Parsuje linie w formacie:
//   2026-07-08 10:15:32 ERROR Nie udało się połączyć z bazą danych
//
// Regex jest skompilowany raz (RegexOptions.Compiled) i trzymany statycznie,
// bo parser może być wywoływany wielokrotnie dla tego samego pliku logów
// (np. raz przez FindErrorEntriesTool, raz przez FindExceptionEntriesTool).
public sealed partial class LogEntryParser : ILogEntryParser
{
    [GeneratedRegex(
        @"^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(?<level>INFO|WARNING|ERROR)\s+(?<message>.*)$",
        RegexOptions.IgnoreCase)]
    private static partial Regex LogLinePattern();

    public IReadOnlyList<LogEntry> Parse(IEnumerable<string> lines)
    {
        var entries = new List<LogEntry>();

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var match = LogLinePattern().Match(line);
            if (!match.Success)
            {
                // Linia nie pasuje do znanego formatu (np. druga linia stack trace) -
                // dla prostoty tego projektu edukacyjnego po prostu ją pomijamy,
                // zamiast próbować doklejać ją do poprzedniego wpisu.
                continue;
            }

            var timestamp = DateTime.ParseExact(
                match.Groups["timestamp"].Value,
                "yyyy-MM-dd HH:mm:ss",
                CultureInfo.InvariantCulture);

            var severity = Enum.Parse<LogSeverity>(match.Groups["level"].Value, ignoreCase: true);
            var message = match.Groups["message"].Value;

            entries.Add(new LogEntry(timestamp, severity, message, RawLine: line));
        }

        return entries;
    }
}
