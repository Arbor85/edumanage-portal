using FluentAssertions;
using LogAgentDemo.App.Services;
using Microsoft.Extensions.AI;
using Xunit;

namespace LogAgentDemo.Tests.Services;

// Pamięć rozmowy to tylko lista wiadomości, ale jej poprawność ma
// bezpośredni wpływ na to, czy model "widzi" pełen kontekst rozmowy -
// stąd testy sprawdzające kolejność i to, że system prompt zawsze jest pierwszy.
public sealed class ConversationMemoryTests
{
    [Fact]
    public void SetSystemPrompt_CalledFirst_InsertsSystemMessageAtStart()
    {
        var memory = new ConversationMemory();

        memory.SetSystemPrompt("Jesteś asystentem.");

        memory.Messages.Should().ContainSingle();
        memory.Messages[0].Role.Should().Be(ChatRole.System);
    }

    [Fact]
    public void SetSystemPrompt_CalledAfterOtherMessages_StaysAtIndexZero()
    {
        var memory = new ConversationMemory();
        memory.AddUserMessage("Cześć");

        memory.SetSystemPrompt("Jesteś asystentem.");

        memory.Messages[0].Role.Should().Be(ChatRole.System);
        memory.Messages[1].Role.Should().Be(ChatRole.User);
    }

    [Fact]
    public void AddUserMessage_AppendsMessageWithUserRole()
    {
        var memory = new ConversationMemory();

        memory.AddUserMessage("Jakie były błędy?");

        memory.Messages.Should().ContainSingle(m => m.Role == ChatRole.User && m.Text == "Jakie były błędy?");
    }

    [Fact]
    public void Clear_RemovesAllMessagesIncludingSystemPrompt()
    {
        var memory = new ConversationMemory();
        memory.SetSystemPrompt("system");
        memory.AddUserMessage("user");

        memory.Clear();

        memory.Messages.Should().BeEmpty();
    }
}
