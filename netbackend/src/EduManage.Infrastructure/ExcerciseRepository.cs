using System.Text.Json.Nodes;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class ExcerciseRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), IExcerciseRepository
{
    private static readonly IReadOnlyList<ExcerciseOut> DefaultExcercises =
    [
        new(1, "Squat", "Back squat pattern", "Quadriceps", [new JsonObject { ["name"] = "Quadriceps" }], ["Legs", "Strength"]),
        new(2, "Bench Press", "Barbell horizontal press", "Chest", [new JsonObject { ["name"] = "Pectorals" }], ["Chest", "Strength"]),
        new(3, "Deadlift", "Hip hinge pull", "Posterior Chain", [new JsonObject { ["name"] = "Hamstrings" }], ["Back", "Strength"])
    ];

    public async Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken)
    {
        var existing = await ListAsync<ExcerciseOut>(RepositoryCategories.Excercises, cancellationToken);
        if (existing.Count > 0)
        {
            return existing;
        }

        foreach (var excercise in DefaultExcercises)
        {
            await SaveAsync(RepositoryCategories.Excercises, excercise.Id.ToString(), excercise, cancellationToken);
        }

        return await ListAsync<ExcerciseOut>(RepositoryCategories.Excercises, cancellationToken);
    }
}
