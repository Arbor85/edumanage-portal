using LogAgentDemo.App.Models;

namespace LogAgentDemo.App.Services;

// Odpowiedzialność: zamiana surowych linii tekstu na typowane obiekty LogEntry.
// Rozdzielenie "czytania pliku" (ILogFileReader) od "rozumienia formatu logów"
// (ILogEntryParser) to klasyczne zastosowanie Single Responsibility Principle -
// gdyby format logów się zmienił, modyfikujemy tylko tę jedną klasę.
public interface ILogEntryParser
{
    // Linie, których nie da się rozpoznać jako poprawny wpis logu (np. puste,
    // albo kontynuacja stack trace w kolejnej linii), są pomijane.
    IReadOnlyList<LogEntry> Parse(IEnumerable<string> lines);
}
