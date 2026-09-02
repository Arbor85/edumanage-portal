using EduManage.Application;
using EduManage.Infrastructure;
using EduManage.Mcp;
using EduManage.Mcp.Tools;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

builder.Services.Configure<McpSettings>(builder.Configuration.GetSection("Mcp"));
builder.Services.AddApplication();
builder.Services.AddInfrastructure(
    builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=edumanage.db");

builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<PlanTools>()
    .WithTools<WorkoutHistoryTools>()
    .WithTools<ClientTools>();

var app = builder.Build();

app.Use(async (context, next) =>
{
    var settings = context.RequestServices.GetRequiredService<IOptions<McpSettings>>().Value;
    if (string.IsNullOrEmpty(settings.ApiKey)
        || !context.Request.Headers.TryGetValue("X-Api-Key", out var key)
        || key != settings.ApiKey)
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Unauthorized");
        return;
    }
    await next(context);
});

app.MapMcp();
app.Run();
