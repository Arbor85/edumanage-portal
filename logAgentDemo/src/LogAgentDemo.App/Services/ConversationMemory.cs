using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Services;

// Implementacja pamięci rozmowy trzymana w RAM, w obrębie jednego uruchomienia
// aplikacji. Nie jest zapisywana na dysk - w tym demo nie jest to potrzebne,
// a dodanie trwałości (np. do pliku albo bazy) byłoby prostym rozszerzeniem
// tej klasy bez zmiany reszty aplikacji (Agent zna tylko interfejs IConversationMemory).
public sealed class ConversationMemory : IConversationMemory
{
    private readonly List<ChatMessage> _messages = [];

    public IReadOnlyList<ChatMessage> Messages => _messages;

    public void SetSystemPrompt(string systemPrompt)
    {
        // System prompt zawsze musi być pierwszą wiadomością w historii -
        // to on definiuje "osobowość" i zasady działania agenta dla modelu.
        _messages.RemoveAll(m => m.Role == ChatRole.System);
        _messages.Insert(0, new ChatMessage(ChatRole.System, systemPrompt));
    }

    public void AddUserMessage(string content) =>
        _messages.Add(new ChatMessage(ChatRole.User, content));

    public void AddMessages(IEnumerable<ChatMessage> messages) =>
        _messages.AddRange(messages);

    public void Clear() => _messages.Clear();
}
