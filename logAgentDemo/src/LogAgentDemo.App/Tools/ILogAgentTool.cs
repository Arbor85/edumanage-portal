using Microsoft.Extensions.AI;

namespace LogAgentDemo.App.Tools;

// Wspólny "kształt" wszystkich narzędzi, które agent może wywołać.
//
// Kluczowa idea agentów opartych o function calling: narzędzie to zwykła
// metoda C#, którą opisujemy modelowi (nazwa, opis, parametry). Model NIE
// wykonuje kodu - on tylko "prosi" nas, żebyśmy wykonali konkretną metodę
// z konkretnymi argumentami. To my (Agent) faktycznie ją uruchamiamy i
// odsyłamy wynik z powrotem do modelu.
//
// AIFunctionFactory.Create(...) z Microsoft.Extensions.AI zamienia zwykłą
// metodę C# (z atrybutami [Description]) w AIFunction - obiekt, który LLM
// rozumie jako "dostępne narzędzie".
public interface ILogAgentTool
{
    AIFunction AsAIFunction();
}
