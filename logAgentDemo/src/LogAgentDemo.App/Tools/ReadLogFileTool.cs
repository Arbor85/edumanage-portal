using System.ComponentModel;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Services;
using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Tools;

// Narzędzie #1: surowy odczyt pliku logów.
//
// To najprostsze możliwe narzędzie - często pierwsze, które model wybierze,
// gdy użytkownik pyta coś ogólnego typu "co jest w logach?". Zwraca cały
// (albo ostatnie N linii) plik jako tekst, bez żadnej interpretacji.
public sealed class ReadLogFileTool(ILogFileReader fileReader, AgentOptions options) : ILogAgentTool
{
    public AIFunction AsAIFunction() => AIFunctionFactory.Create(ReadLogFile);

    [Description(
        "Odczytuje surową zawartość pliku logów aplikacji. Użyj tego narzędzia, " +
        "gdy potrzebujesz zobaczyć ogólną zawartość logów, zanim zdecydujesz, " +
        "czy potrzebne jest bardziej szczegółowe wyszukiwanie błędów lub wyjątków.")]
    public async Task<string> ReadLogFile(
        [Description("Maksymalna liczba ostatnich linii do zwrócenia. Pomiń, aby otrzymać cały plik.")]
        int? maxLines = null)
    {
        var lines = await fileReader.ReadLinesAsync(options.LogFilePath);

        var selected = maxLines is > 0
            ? lines.TakeLast(maxLines.Value)
            : lines;

        return string.Join(Environment.NewLine, selected);
    }
}
