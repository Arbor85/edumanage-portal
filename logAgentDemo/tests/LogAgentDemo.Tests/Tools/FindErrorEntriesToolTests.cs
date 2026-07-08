using FluentAssertions;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Services;
using LogAgentDemo.App.Tools;
using LogAgentDemo.Tests.TestDoubles;
using Xunit;

namespace LogAgentDemo.Tests.Tools;

public sealed class FindErrorEntriesToolTests
{
    private static readonly string[] SampleLines =
    [
        "2026-07-08 08:00:00 INFO Wszystko działa",
        "2026-07-08 08:01:00 ERROR Baza danych niedostępna",
        "2026-07-08 08:02:00 WARNING Wolne zapytanie",
        "2026-07-08 08:03:00 ERROR HTTP 500 Internal Server Error"
    ];

    private static FindErrorEntriesTool CreateTool(IReadOnlyList<string> lines) =>
        new(new FakeLogFileReader(lines), new LogEntryParser(), new AgentOptions());

    [Fact]
    public async Task FindErrorEntries_ReturnsOnlyErrorSeverityEntries()
    {
        var tool = CreateTool(SampleLines);

        var result = await tool.FindErrorEntries();

        result.Should().Contain("Baza danych niedostępna");
        result.Should().Contain("HTTP 500 Internal Server Error");
        result.Should().NotContain("Wszystko działa");
        result.Should().NotContain("Wolne zapytanie");
    }

    [Fact]
    public async Task FindErrorEntries_NoErrorsInLog_ReturnsExplicitNoResultsMessage()
    {
        var tool = CreateTool(["2026-07-08 08:00:00 INFO Wszystko OK"]);

        var result = await tool.FindErrorEntries();

        result.Should().Be("Nie znaleziono żadnych wpisów o poziomie ERROR w pliku logów.");
    }

    [Fact]
    public async Task FindErrorEntries_WithLimit_ReturnsOnlyLastNMatches()
    {
        var tool = CreateTool(SampleLines);

        var result = await tool.FindErrorEntries(limit: 1);

        result.Should().Contain("HTTP 500 Internal Server Error");
        result.Should().NotContain("Baza danych niedostępna");
    }
}
