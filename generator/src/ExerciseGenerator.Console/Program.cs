using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var stopwatch = Stopwatch.StartNew();

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddExerciseGeneratorInfrastructure(context.Configuration);
    })
    .ConfigureLogging(logging =>
    {
        logging.ClearProviders();
        logging.AddConsole(options =>
        {
            options.FormatterName = "simple";
        });
        logging.SetMinimumLevel(LogLevel.Information);
    })
    .Build();

var logger = host.Services.GetRequiredService<ILogger<Program>>();
var aggregator = host.Services.GetRequiredService<IExerciseAggregatorService>();

logger.LogInformation("=== Exercise Database Generator ===");
logger.LogInformation("Starting aggregation from all configured sources...");

try
{
    using var cts = new CancellationTokenSource();
    System.Console.CancelKeyPress += (_, e) =>
    {
        e.Cancel = true;
        logger.LogWarning("Cancellation requested...");
        cts.Cancel();
    };

    var (exercises, report) = await aggregator.AggregateAsync(cts.Token);

    stopwatch.Stop();
    report.ExecutionTimeSeconds = stopwatch.Elapsed.TotalSeconds;

    // Ensure output directory
    const string outputDir = "output";
    Directory.CreateDirectory(outputDir);

    var jsonOptions = new JsonSerializerOptions
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // Write exercises.json
    var exercisesPath = Path.Combine(outputDir, "exercises.json");
    var exercisesJson = JsonSerializer.Serialize(exercises, jsonOptions);
    await File.WriteAllTextAsync(exercisesPath, exercisesJson, cts.Token);

    // Write report.json
    var reportPath = Path.Combine(outputDir, "report.json");
    var reportJson = JsonSerializer.Serialize(report, jsonOptions);
    await File.WriteAllTextAsync(reportPath, reportJson, cts.Token);

    logger.LogInformation("───────────────────────────────────────");
    logger.LogInformation("Total fetched:    {Total}", report.TotalFetchedRecords);
    logger.LogInformation("Duplicates removed: {Dup}", report.DuplicatesRemoved);
    logger.LogInformation("Validation errors:  {Val}", report.ValidationErrorsRemoved);
    logger.LogInformation("Final exercises:    {Final}", report.FinalRecordCount);
    logger.LogInformation("Time elapsed:       {Time:F2}s", report.ExecutionTimeSeconds);
    logger.LogInformation("───────────────────────────────────────");
    logger.LogInformation("Output written to:");
    logger.LogInformation("  {Path}", Path.GetFullPath(exercisesPath));
    logger.LogInformation("  {Path}", Path.GetFullPath(reportPath));
}
catch (OperationCanceledException)
{
    logger.LogWarning("Operation cancelled by user.");
    return 1;
}
catch (Exception ex)
{
    logger.LogError(ex, "Fatal error during exercise generation");
    return 2;
}

return 0;
