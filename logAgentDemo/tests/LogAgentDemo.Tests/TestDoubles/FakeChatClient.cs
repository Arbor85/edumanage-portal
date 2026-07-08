using Microsoft.Extensions.AI;

namespace LogAgentDemo.Tests.TestDoubles;

// Atrapa modelu językowego. Testujemy pętlę decyzyjną agenta (LogAnalysisAgent)
// bez uruchamiania prawdziwej Ollamy - zamiast tego z góry "skryptujemy",
// co model "odpowie" w kolejnych rundach (np. najpierw prośba o narzędzie,
// potem ostateczna odpowiedź tekstowa). Dzięki temu test jest szybki,
// deterministyczny i nie wymaga żadnej infrastruktury.
public sealed class FakeChatClient(Queue<ChatResponse> scriptedResponses) : IChatClient
{
    public List<IEnumerable<ChatMessage>> ReceivedMessageBatches { get; } = [];

    public Task<ChatResponse> GetResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ReceivedMessageBatches.Add(messages.ToList());

        if (scriptedResponses.Count == 0)
        {
            throw new InvalidOperationException("FakeChatClient: brak kolejnej zaskryptowanej odpowiedzi.");
        }

        return Task.FromResult(scriptedResponses.Dequeue());
    }

    public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default) =>
        throw new NotSupportedException("Ten fake nie wspiera odpowiedzi strumieniowych - nie jest potrzebne w tych testach.");

    public object? GetService(Type serviceType, object? serviceKey = null) => null;

    public void Dispose()
    {
    }
}
