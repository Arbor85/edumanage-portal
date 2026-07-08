using LogAgentDemo.App.Services;

namespace LogAgentDemo.Tests.TestDoubles;

// Prosta atrapa (test double) ILogFileReader, dzięki której testy narzędzi
// i parsera nie dotykają prawdziwego dysku - dostają z góry ustalone linie.
// To pokazuje sens rozdzielenia I/O (LogFileReader) od logiki (parser, tools)
// za interfejsem: w testach podmieniamy tylko tę jedną, "brudną" część.
public sealed class FakeLogFileReader(IReadOnlyList<string> lines) : ILogFileReader
{
    public Task<IReadOnlyList<string>> ReadLinesAsync(string filePath, CancellationToken cancellationToken = default) =>
        Task.FromResult(lines);
}
