using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Services;

// "Pamięć" agenta - w tej najprostszej, edukacyjnej formie to po prostu
// historia wiadomości wymienianych z modelem (system/user/assistant/tool).
//
// Dlaczego to jest ważne dla zrozumienia agentów: LLM sam w sobie jest
// bezstanowy - nie "pamięta" niczego między wywołaniami. To WARSTWA WOKÓŁ
// modelu (czyli ta klasa) odpowiada za to, że model "wie", o czym była mowa
// wcześniej, oraz widzi wyniki narzędzi, które wcześniej wywołał.
public interface IConversationMemory
{
    IReadOnlyList<ChatMessage> Messages { get; }

    void SetSystemPrompt(string systemPrompt);
    void AddUserMessage(string content);
    void AddMessages(IEnumerable<ChatMessage> messages);
    void Clear();
}
