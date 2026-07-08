using FluentAssertions;
using LogAgentDemo.App.Services;
using Xunit;

namespace LogAgentDemo.Tests.Services;

// LogFileReader to jedyna klasa dotykająca dysku - ten test faktycznie
// tworzy tymczasowy plik, żeby zweryfikować prawdziwe I/O (a nie atrapę).
public sealed class LogFileReaderTests : IDisposable
{
    private readonly string _tempFilePath = Path.GetTempFileName();

    [Fact]
    public async Task ReadLinesAsync_ExistingFile_ReturnsAllLinesInOrder()
    {
        await File.WriteAllLinesAsync(_tempFilePath, ["linia 1", "linia 2", "linia 3"]);
        var reader = new LogFileReader();

        var lines = await reader.ReadLinesAsync(_tempFilePath);

        lines.Should().Equal("linia 1", "linia 2", "linia 3");
    }

    [Fact]
    public async Task ReadLinesAsync_MissingFile_ThrowsFileNotFoundException()
    {
        var reader = new LogFileReader();
        var missingPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var act = async () => await reader.ReadLinesAsync(missingPath);

        await act.Should().ThrowAsync<FileNotFoundException>();
    }

    public void Dispose() => File.Delete(_tempFilePath);
}
