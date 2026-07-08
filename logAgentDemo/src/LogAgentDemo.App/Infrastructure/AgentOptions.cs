namespace LogAgentDemo.App.Infrastructure;

// Konfiguracja aplikacji w jednym, prostym miejscu. W realnym projekcie
// trafiłoby to do appsettings.json + IOptions<T>, ale dla czytelności
// tego demo trzymamy to jako zwykłą klasę z wartościami domyślnymi.
public sealed class AgentOptions
{
    // Ścieżka do pliku logów analizowanego przez narzędzia agenta.
    public string LogFilePath { get; init; } = Path.Combine("logs", "app.log");

    // Ollama wystawia API kompatybilne z OpenAI pod /v1 - dzięki temu
    // możemy użyć oficjalnego SDK OpenAI, wskazując mu lokalny adres Ollamy
    // zamiast api.openai.com. To pozwala na naukę tej samej biblioteki,
    // której używa się z prawdziwym OpenAI, ale w 100% lokalnie i za darmo.
    public string OllamaEndpoint { get; init; } = "http://localhost:11434/v1";

    // Model musi być wcześniej pobrany lokalnie poleceniem: ollama pull qwen3:8b
    public string ModelId { get; init; } = "qwen3:8b";
}
