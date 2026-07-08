namespace LogAgentDemo.App.Models;

// Pojedynczy, sparsowany wpis z pliku logów.
//
// Dlaczego mamy osobny model zamiast operować na surowych stringach?
// Bo narzędzia (Tools) i agent nie powinny znać formatu pliku logów -
// to odpowiedzialność parsera (LogEntryParser). Dzięki temu modelowi
// reszta aplikacji operuje na czytelnych, typowanych danych, a nie na
// wyrażeniach regularnych rozsianych po całym kodzie.
public sealed record LogEntry(
    DateTime Timestamp,
    LogSeverity Severity,
    string Message,
    string RawLine)
{
    // Wielu "wyjątków" w logach nie ma osobnego poziomu - pojawiają się
    // jako ERROR z treścią zawierającą nazwę wyjątku (np. "NullReferenceException").
    // To pomocnicza właściwość, z której korzysta FindExceptionEntriesTool,
    // żeby nie duplikować tej samej logiki wyszukiwania w kilku miejscach.
    public bool LooksLikeException =>
        Message.Contains("Exception", StringComparison.OrdinalIgnoreCase);
}
