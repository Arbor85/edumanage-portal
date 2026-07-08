namespace LogAgentDemo.App.Models;

// Poziomy istotności wpisów, jakie potrafimy rozpoznać w plikach logów.
// To jest celowo prosty, zamknięty zbiór - w prawdziwym systemie logowania
// (np. Serilog, NLog) poziomów bywa więcej (Trace, Debug, Fatal...),
// ale na potrzeby nauki wystarczą trzy, które faktycznie występują w danych testowych.
public enum LogSeverity
{
    Info,
    Warning,
    Error
}
