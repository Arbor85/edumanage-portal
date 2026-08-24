using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure.Persistence;

public static class ExerciseSeedExtensions
{
    private static readonly JsonSerializerOptions SeedJsonSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task SeedExercisesFromJsonAsync(this IServiceProvider serviceProvider, CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<EduManageDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        var assembly = typeof(DependencyInjection).Assembly;

        var jsonStream =
            assembly.GetManifestResourceStream("EduManage.Infrastructure.gym_exercises_full.json") ??
            assembly.GetManifestResourceStream("EduManage.Infrastructure.gym_exercises.json");

        if (jsonStream is null)
        {
            throw new InvalidOperationException("No exercise seed file found in EduManage.Infrastructure assembly.");
        }

        var exerciseSeeds = await JsonSerializer.DeserializeAsync<List<GymExerciseSeedDto>>(
            jsonStream,
            SeedJsonSerializerOptions,
            cancellationToken: cancellationToken)
            ?? [];

        if (exerciseSeeds.Count == 0)
        {
            return;
        }

        var existingNames = (await dbContext.Exercises
            .Select(e => e.Name)
            .ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toAdd = exerciseSeeds
            .Where(seed => !string.IsNullOrWhiteSpace(seed.Name) && !existingNames.Contains(seed.Name))
            .Select(seed =>
            {
                var primary = seed.PrimaryMuscle ?? string.Empty;
                var secondaries = seed.SecondaryMuscles ?? [];

                List<Muscle> muscles = seed.Muscles is { Count: > 0 }
                    ? seed.Muscles.Select(m => new Muscle(m.Name)).ToList()
                    : (string.IsNullOrWhiteSpace(primary) ? [] : [new Muscle(primary)]);

                return new Exercise
                {
                    Name = seed.Name,
                    ShortDescription = seed.ShortDescription ?? string.Empty,
                    PrimaryMuscle = primary,
                    SecondaryMuscles = secondaries,
                    Muscles = muscles,
                    Tags = seed.Tags ?? [],
                    ActivityType = (ActivityType)(seed.ActivityType ?? 0),
                    ActivityTrackType = (ActivityTrackType)(seed.ActivityTrackType ?? 0),
                    Instructions = seed.Instructions is { Count: > 0 } ? seed.Instructions : null,
                    Equipment = seed.Equipment,
                    Level = seed.Level,
                    Force = seed.Force,
                    Mechanic = seed.Mechanic,
                    Category = seed.Category,
                    ImagePath = seed.ImagePath,
                    GifPath = seed.GifPath,
                    DatasetId = seed.DatasetId,
                };
            })
            .ToList();

        if (toAdd.Count == 0)
        {
            return;
        }

        await dbContext.Exercises.AddRangeAsync(toAdd, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private sealed record MuscleDto(string Name);

    private sealed record GymExerciseSeedDto(
        string Name,
        string? ShortDescription = null,
        string? Description = null,
        string? PrimaryMuscle = null,
        List<string>? SecondaryMuscles = null,
        List<MuscleDto>? Muscles = null,
        List<string>? Tags = null,
        int? ActivityType = null,
        int? ActivityTrackType = null,
        List<string>? Instructions = null,
        string? Equipment = null,
        string? Level = null,
        string? Force = null,
        string? Mechanic = null,
        string? Category = null,
        string? ImagePath = null,
        string? GifPath = null,
        string? DatasetId = null);
}
