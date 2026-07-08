using FluentAssertions;
using LogAgentDemo.App.Agents;
using LogAgentDemo.App.Services;
using LogAgentDemo.App.Tools;
using LogAgentDemo.Tests.TestDoubles;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LogAgentDemo.Tests.Agents;

// Te testy pokazują samo sedno "bycia agentem": pętlę decyzyjną
// pytanie -> (opcjonalnie: narzędzie -> wynik -> pytanie ponownie) -> odpowiedź.
// Model jest w pełni zaskryptowany (FakeChatClient), więc testujemy wyłącznie
// logikę orkiestracji w LogAnalysisAgent, a nie prawdziwą inteligencję modelu.
public sealed class LogAnalysisAgentTests
{
    private static LogAnalysisAgent CreateAgent(
        Queue<ChatResponse> scriptedResponses,
        IEnumerable<ILogAgentTool> tools,
        out IConversationMemory memory)
    {
        memory = new ConversationMemory();
        var chatClient = new FakeChatClient(scriptedResponses);
        return new LogAnalysisAgent(chatClient, memory, tools, NullLogger<LogAnalysisAgent>.Instance);
    }

    [Fact]
    public async Task AskAsync_ModelAnswersDirectly_ReturnsTextWithoutCallingAnyTool()
    {
        var tool = new FakeLogAgentTool("Dummy", () => "nieużywane");
        var responses = new Queue<ChatResponse>();
        responses.Enqueue(new ChatResponse(new ChatMessage(ChatRole.Assistant, "Brak błędów w logach.")));

        var agent = CreateAgent(responses, [tool], out _);

        var answer = await agent.AskAsync("Czy są jakieś błędy?");

        answer.Should().Be("Brak błędów w logach.");
        tool.WasInvoked.Should().BeFalse();
    }

    [Fact]
    public async Task AskAsync_ModelRequestsTool_InvokesToolAndFeedsResultBackBeforeFinalAnswer()
    {
        var tool = new FakeLogAgentTool("FindErrorEntries", () => "Znaleziono 2 błędy.");

        var responses = new Queue<ChatResponse>();
        responses.Enqueue(new ChatResponse(new ChatMessage(
            ChatRole.Assistant,
            [new FunctionCallContent(callId: "call-1", name: "FindErrorEntries")])));
        responses.Enqueue(new ChatResponse(new ChatMessage(
            ChatRole.Assistant,
            "W logach znaleziono 2 błędy.")));

        var agent = CreateAgent(responses, [tool], out var memory);

        var answer = await agent.AskAsync("Jakie były błędy?");

        answer.Should().Be("W logach znaleziono 2 błędy.");
        tool.WasInvoked.Should().BeTrue();

        // Wynik narzędzia musi trafić do historii jako wiadomość roli Tool -
        // to na jej podstawie model formułuje drugą, ostateczną odpowiedź.
        memory.Messages.Should().Contain(m =>
            m.Role == ChatRole.Tool &&
            m.Contents.OfType<FunctionResultContent>().Any(c => c.CallId == "call-1"));
    }

    [Fact]
    public async Task AskAsync_ModelKeepsRequestingTools_StopsAfterMaxRoundsWithFallbackMessage()
    {
        var tool = new FakeLogAgentTool("FindErrorEntries", () => "wynik");

        var responses = new Queue<ChatResponse>();
        for (var i = 0; i < 10; i++)
        {
            responses.Enqueue(new ChatResponse(new ChatMessage(
                ChatRole.Assistant,
                [new FunctionCallContent(callId: $"call-{i}", name: "FindErrorEntries")])));
        }

        var agent = CreateAgent(responses, [tool], out _);

        var answer = await agent.AskAsync("Pytanie testowe");

        answer.Should().Contain("nie udało mi się");
    }

    [Fact]
    public async Task AskAsync_UnknownToolRequestedByModel_ReturnsErrorResultInsteadOfThrowing()
    {
        var responses = new Queue<ChatResponse>();
        responses.Enqueue(new ChatResponse(new ChatMessage(
            ChatRole.Assistant,
            [new FunctionCallContent(callId: "call-1", name: "NieistniejaceNarzedzie")])));
        responses.Enqueue(new ChatResponse(new ChatMessage(ChatRole.Assistant, "OK, spróbuję inaczej.")));

        var agent = CreateAgent(responses, [], out _);

        var answer = await agent.AskAsync("Test");

        answer.Should().Be("OK, spróbuję inaczej.");
    }
}
