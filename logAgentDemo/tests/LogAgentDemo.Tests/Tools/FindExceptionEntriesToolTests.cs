using FluentAssertions;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Services;
using LogAgentDemo.App.Tools;
using LogAgentDemo.Tests.TestDoubles;
using Xunit;

namespace LogAgentDemo.Tests.Tools;

public sealed class FindExceptionEntriesToolTests
{
    private static readonly string[] SampleLines =
    [
        "2026-07-08 08:00:00 ERROR System.NullReferenceException: Object reference not set",
        "2026-07-08 08:01:00 ERROR HTTP 404 Not Found",
        "2026-07-08 08:02:00 ERROR System.TimeoutException: The operation has timed out"
    ];

    private static FindExceptionEntriesTool CreateTool(IReadOnlyList<string> lines) =>
        new(new FakeLogFileReader(lines), new LogEntryParser(), new AgentOptions());

    [Fact]
    public async Task FindExceptionEntries_ReturnsOnlyEntriesMentioningException()
    {
        var tool = CreateTool(SampleLines);

        var result = await tool.FindExceptionEntries();

        result.Should().Contain("NullReferenceException");
        result.Should().Contain("TimeoutException");
        result.Should().NotContain("HTTP 404 Not Found");
    }

    [Fact]
    public async Task FindExceptionEntries_NoExceptionsPresent_ReturnsExplicitNoResultsMessage()
    {
        var tool = CreateTool(["2026-07-08 08:00:00 ERROR HTTP 404 Not Found"]);

        var result = await tool.FindExceptionEntries();

        result.Should().Be("Nie znaleziono żadnych wpisów zawierających wyjątki w pliku logów.");
    }
}
