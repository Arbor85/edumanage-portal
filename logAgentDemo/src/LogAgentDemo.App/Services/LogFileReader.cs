namespace LogAgentDemo.App.Services;

// Jedyna klasa w projekcie, która dotyka systemu plików.
// Trzymanie I/O w jednym miejscu ułatwia testowanie reszty systemu
// (np. LogEntryParser testujemy na stringach, bez plików na dysku).
public sealed class LogFileReader : ILogFileReader
{
    public async Task<IReadOnlyList<string>> ReadLinesAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"Nie znaleziono pliku logów: {filePath}", filePath);
        }

        var lines = await File.ReadAllLinesAsync(filePath, cancellationToken);
        return lines;
    }
}
