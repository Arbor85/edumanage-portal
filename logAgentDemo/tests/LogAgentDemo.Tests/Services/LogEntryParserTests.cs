using FluentAssertions;
using LogAgentDemo.App.Models;
using LogAgentDemo.App.Services;
using Xunit;

namespace LogAgentDemo.Tests.Services;

// Ten test pokazuje kluczową zasadę: LogEntryParser jest czystą funkcją
// (string[] -> LogEntry[]), więc testujemy go bez żadnego pliku na dysku.
public sealed class LogEntryParserTests
{
    private readonly LogEntryParser _parser = new();

    [Fact]
    public void Parse_ValidLine_ExtractsTimestampSeverityAndMessage()
    {
        var lines = new[] { "2026-07-08 08:02:15 ERROR Coś poszło nie tak" };

        var result = _parser.Parse(lines);

        result.Should().ContainSingle();
        result[0].Timestamp.Should().Be(new DateTime(2026, 7, 8, 8, 2, 15));
        result[0].Severity.Should().Be(LogSeverity.Error);
        result[0].Message.Should().Be("Coś poszło nie tak");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("to nie jest linia logu")]
    public void Parse_UnrecognizedOrEmptyLine_IsSkipped(string line)
    {
        var result = _parser.Parse([line]);

        result.Should().BeEmpty();
    }

    [Fact]
    public void Parse_MultipleLines_PreservesOrderAndSkipsInvalidOnes()
    {
        var lines = new[]
        {
            "2026-07-08 08:00:00 INFO Start",
            "linia bez sensu",
            "2026-07-08 08:00:05 WARNING Uwaga"
        };

        var result = _parser.Parse(lines);

        result.Should().HaveCount(2);
        result[0].Message.Should().Be("Start");
        result[1].Message.Should().Be("Uwaga");
    }

    [Fact]
    public void LooksLikeException_MessageContainingExceptionWord_ReturnsTrue()
    {
        var entry = new LogEntry(DateTime.Now, LogSeverity.Error, "System.NullReferenceException: boom", "raw");

        entry.LooksLikeException.Should().BeTrue();
    }

    [Fact]
    public void LooksLikeException_PlainErrorMessage_ReturnsFalse()
    {
        var entry = new LogEntry(DateTime.Now, LogSeverity.Error, "HTTP 404 Not Found", "raw");

        entry.LooksLikeException.Should().BeFalse();
    }
}
