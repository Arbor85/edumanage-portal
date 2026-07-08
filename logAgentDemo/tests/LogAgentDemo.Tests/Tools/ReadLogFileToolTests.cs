using FluentAssertions;
using LogAgentDemo.App.Infrastructure;
using LogAgentDemo.App.Tools;
using LogAgentDemo.Tests.TestDoubles;
using Xunit;

namespace LogAgentDemo.Tests.Tools;

public sealed class ReadLogFileToolTests
{
    [Fact]
    public async Task ReadLogFile_NoLimit_ReturnsAllLinesJoined()
    {
        var reader = new FakeLogFileReader(["linia A", "linia B", "linia C"]);
        var tool = new ReadLogFileTool(reader, new AgentOptions());

        var result = await tool.ReadLogFile();

        result.Should().Be($"linia A{Environment.NewLine}linia B{Environment.NewLine}linia C");
    }

    [Fact]
    public async Task ReadLogFile_WithMaxLines_ReturnsOnlyLastNLines()
    {
        var reader = new FakeLogFileReader(["linia A", "linia B", "linia C"]);
        var tool = new ReadLogFileTool(reader, new AgentOptions());

        var result = await tool.ReadLogFile(maxLines: 2);

        result.Should().Be($"linia B{Environment.NewLine}linia C");
    }

    [Fact]
    public void AsAIFunction_ExposesDescriptiveNameForTheModel()
    {
        var tool = new ReadLogFileTool(new FakeLogFileReader([]), new AgentOptions());

        var function = tool.AsAIFunction();

        // Nazwa i opis to jedyne, co model językowy "widzi" z tego narzędzia -
        // to na ich podstawie decyduje, czy i kiedy je wywołać.
        function.Name.Should().Be("ReadLogFile");
        function.Description.Should().NotBeNullOrWhiteSpace();
    }
}
