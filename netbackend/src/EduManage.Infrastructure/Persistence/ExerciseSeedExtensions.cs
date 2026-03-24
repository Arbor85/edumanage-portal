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

        await dbContext.Database.EnsureCreatedAsync(cancellationToken);

        var jsonStream = typeof(DependencyInjection).Assembly
            .GetManifestResourceStream("EduManage.Infrastructure.gym_exercises.json");

        if (jsonStream is null)
        {
            throw new InvalidOperationException("Embedded exercise seed file was not found: EduManage.Infrastructure.gym_exercises.json");
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

        var existingExerciseNames = await dbContext.Exercises
            .Select(exercise => exercise.Name)
            .ToListAsync(cancellationToken);
        var existingExerciseNamesSet = existingExerciseNames
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var exercisesToAdd = exerciseSeeds
            .Where(seed => !string.IsNullOrWhiteSpace(seed.Name) && !existingExerciseNamesSet.Contains(seed.Name))
            .Select(seed => new Exercise
            {
                Name = seed.Name,
                ShortDescription = seed.Description ?? string.Empty,
                PrimaryMuscle = seed.PrimaryMuscle ?? string.Empty,
                SecondaryMuscles = [],
                Muscles = string.IsNullOrWhiteSpace(seed.PrimaryMuscle)
                    ? []
                    : [new Muscle(seed.PrimaryMuscle)],
                Tags = []
            })
            .ToList();

        if (exercisesToAdd.Count == 0)
        {
            return;
        }

        await dbContext.Exercises.AddRangeAsync(exercisesToAdd, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private sealed record GymExerciseSeedDto(string Name, string Description, string PrimaryMuscle);
}
