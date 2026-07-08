using LogAgentDemo.App.Tools;
using Microsoft.Extensions.AI;

namespace LogAgentDemo.Tests.TestDoubles;

// Minimalne narzędzie testowe - pozwala sprawdzić, że LogAnalysisAgent
// poprawnie znajduje i wywołuje narzędzie po nazwie, bez angażowania
// prawdziwych narzędzi analizujących logi.
public sealed class FakeLogAgentTool(string name, Func<string> onInvoke) : ILogAgentTool
{
    public bool WasInvoked { get; private set; }

    public AIFunction AsAIFunction() =>
        AIFunctionFactory.Create(() =>
        {
            WasInvoked = true;
            return onInvoke();
        }, name, "Narzędzie testowe.");
}
