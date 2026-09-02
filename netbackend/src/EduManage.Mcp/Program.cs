using EduManage.Application;
using EduManage.Application.Contracts;
using EduManage.Infrastructure;
using EduManage.Mcp.Services;
using EduManage.Mcp.Tools;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(
    builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=edumanage.db");
builder.Services.AddScoped<ICurrentTrainerService, CurrentTrainerService>();

builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<PlanTools>()
    .WithTools<WorkoutHistoryTools>()
    .WithTools<ClientTools>()
    .WithTools<RoutineTools>();

var app = builder.Build();

app.Use(async (context, next) =>
{
    if (!context.Request.Headers.TryGetValue("X-Api-Key", out var keyValue) || string.IsNullOrEmpty(keyValue))
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Unauthorized");
        return;
    }

    var repo = context.RequestServices.GetRequiredService<IApiKeyRepository>();
    var apiKey = await repo.GetByKeyAsync(keyValue!, CancellationToken.None);
    if (apiKey is null)
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Unauthorized");
        return;
    }

    var trainerService = (CurrentTrainerService)context.RequestServices.GetRequiredService<ICurrentTrainerService>();
    trainerService.UserId = apiKey.UserId;

    await next(context);
});

app.MapMcp();
app.Run();
