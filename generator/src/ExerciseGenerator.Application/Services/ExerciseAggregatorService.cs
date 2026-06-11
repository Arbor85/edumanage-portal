using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using Microsoft.Extensions.Logging;

namespace ExerciseGenerator.Application.Services;

public class ExerciseAggregatorService(
    IEnumerable<IExerciseSource> sources,
    IDeduplicationService deduplicationService,
    ITagClassificationService tagService,
    IMuscleClassificationService muscleService,
    IDescriptionGeneratorService descriptionService,
    IActivityClassificationService activityService,
    IValidationService validationService,
    ILogger<ExerciseAggregatorService> logger) : IExerciseAggregatorService
{
    public async Task<(IReadOnlyList<Exercise> Exercises, Report Report)> AggregateAsync(
        CancellationToken cancellationToken = default)
    {
        var report = new Report { GeneratedAt = DateTime.UtcNow };
        var allExercises = new List<Exercise>();

        foreach (var source in sources)
        {
            try
            {
                logger.LogInformation("Fetching from {Source}...", source.SourceName);
                var exercises = await source.FetchExercisesAsync(cancellationToken);
                var list = exercises.ToList();
                report.RecordsPerSource[source.SourceName] = list.Count;
                report.TotalFetchedRecords += list.Count;
                allExercises.AddRange(list);
                logger.LogInformation("Fetched {Count} exercises from {Source}", list.Count, source.SourceName);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to fetch from {Source}", source.SourceName);
                report.SourceErrors.Add($"{source.SourceName}: {ex.Message}");
                report.RecordsPerSource[source.SourceName] = 0;
            }
        }

        logger.LogInformation("Total fetched: {Count} exercises across all sources", allExercises.Count);

        foreach (var exercise in allExercises)
        {
            muscleService.ClassifyMuscles(exercise);
            activityService.Classify(exercise);
            descriptionService.GenerateDescription(exercise);
            tagService.ClassifyTags(exercise);
        }

        var deduplicated = deduplicationService.Deduplicate(allExercises, out int duplicatesRemoved);
        report.DuplicatesRemoved = duplicatesRemoved;
        logger.LogInformation("Deduplication: removed {Count} duplicates, {Remaining} remaining",
            duplicatesRemoved, deduplicated.Count);

        var validated = new List<Exercise>();
        foreach (var exercise in deduplicated)
        {
            if (validationService.IsValid(exercise, out var error))
            {
                validated.Add(exercise);
            }
            else
            {
                report.ValidationErrors.Add($"'{exercise.Name}': {error}");
            }
        }

        report.ValidationErrorsRemoved = deduplicated.Count - validated.Count;
        report.FinalRecordCount = validated.Count;

        for (int i = 0; i < validated.Count; i++)
        {
            validated[i].Id = i + 1;
        }

        logger.LogInformation("Final exercise count: {Count}", validated.Count);
        return (validated.AsReadOnly(), report);
    }
}
