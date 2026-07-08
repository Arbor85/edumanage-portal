using System.ClientModel;
using LogAgentDemo.App.Agents;
using LogAgentDemo.App.Services;
using LogAgentDemo.App.Tools;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;

namespace LogAgentDemo.App.Infrastructure;

// Całe "okablowanie" Dependency Injection w jednym miejscu.
//
// Dlaczego DI ma tu znaczenie edukacyjne: każda klasa (Agent, narzędzia,
// serwisy) zależy tylko od INTERFEJSÓW, nigdy od konkretnych implementacji
// ani od tego, "skąd" bierze się np. IChatClient. Dzięki temu w testach
// jednostkowych możemy podstawić dowolne atrapy (fake/mock), a w Program.cs
// - prawdziwe implementacje łączące się z Ollamą i dyskiem.
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddLogAgentServices(this IServiceCollection services, AgentOptions options)
    {
        services.AddSingleton(options);

        // Serwisy niskopoziomowe: I/O na plikach i parsowanie formatu logów.
        services.AddSingleton<ILogFileReader, LogFileReader>();
        services.AddSingleton<ILogEntryParser, LogEntryParser>();

        // Narzędzia agenta - każde rejestrujemy jako ILogAgentTool, dzięki
        // czemu LogAnalysisAgent dostaje w konstruktorze IEnumerable<ILogAgentTool>
        // ze wszystkimi trzema naraz, bez wiedzy o ich konkretnych typach.
        services.AddSingleton<ILogAgentTool, ReadLogFileTool>();
        services.AddSingleton<ILogAgentTool, FindErrorEntriesTool>();
        services.AddSingleton<ILogAgentTool, FindExceptionEntriesTool>();

        // Pamięć rozmowy - jeden agent = jedna, żyjąca przez cały czas
        // działania aplikacji historia wiadomości (Singleton).
        services.AddSingleton<IConversationMemory, ConversationMemory>();

        // IChatClient to abstrakcja z Microsoft.Extensions.AI reprezentująca
        // "dowolny model czatowy". Tutaj podłączamy pod nią oficjalne SDK
        // OpenAI, ale skierowane na lokalny adres Ollamy (Ollama wystawia
        // API kompatybilne z OpenAI pod ścieżką /v1). Dzięki tej abstrakcji
        // reszta aplikacji (LogAnalysisAgent) w ogóle nie wie, że "pod spodem"
        // jest Ollama - mogłby to być równie dobrze prawdziwy OpenAI.
        services.AddSingleton<IChatClient>(_ =>
        {
            var openAiClient = new OpenAIClient(
                new ApiKeyCredential("ollama-nie-wymaga-prawdziwego-klucza"),
                new OpenAIClientOptions { Endpoint = new Uri(options.OllamaEndpoint) });

            return openAiClient.GetChatClient(options.ModelId).AsIChatClient();
        });

        services.AddSingleton<LogAnalysisAgent>();

        return services;
    }
}
