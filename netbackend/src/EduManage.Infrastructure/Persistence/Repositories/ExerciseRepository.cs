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
            e.Muscles,
            e.Tags
        )).ToList();
    }
}
