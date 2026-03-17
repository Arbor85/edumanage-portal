using System.Text.Json.Nodes;
using EduManage.Application.Contracts;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ExerciseRepository : IExerciseRepository
{
    private readonly EduManageDbContext _context;

    public ExerciseRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken)
    {
        var exercises = await _context.Exercises.ToListAsync(cancellationToken);
        return exercises.Select(e => new ExcerciseOut(
            e.Id,
            e.Name,
            e.ShortDescription,
            e.PrimaryMuscle,
            ParseJsonObjects(e.MusclesJson),
            e.Tags
        )).ToList();
    }

    private static IReadOnlyList<JsonObject> ParseJsonObjects(string json)
    {
        try
        {
            var parsed = JsonNode.Parse(json);
            if (parsed is JsonArray arr)
            {
                return arr.OfType<JsonObject>().ToList();
            }
        }
        catch { }

        return [];
    }
}
