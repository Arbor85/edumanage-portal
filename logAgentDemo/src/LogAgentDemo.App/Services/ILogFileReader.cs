namespace LogAgentDemo.App.Services;

// Odpowiedzialność: dostęp do surowej zawartości pliku logów na dysku.
// Celowo NIE robi nic więcej (nie parsuje, nie filtruje) - dzięki temu
// możemy go łatwo przetestować i podmienić (np. na wersję czytającą z S3
// albo z pamięci w testach) bez dotykania reszty aplikacji.
public interface ILogFileReader
{
    // Zwraca wszystkie linie pliku logów wskazanego przez filePath.
    // Rzuca wyjątkiem, jeśli plik nie istnieje - świadomie, bo w tej
    // aplikacji brak pliku logów to błąd konfiguracji, a nie normalny przypadek.
    Task<IReadOnlyList<string>> ReadLinesAsync(string filePath, CancellationToken cancellationToken = default);
}
