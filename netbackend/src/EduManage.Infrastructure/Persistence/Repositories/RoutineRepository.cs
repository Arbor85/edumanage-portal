using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class RoutineRepository(EduManageDbContext context)
    : BaseRepository<Routine, string>(context), IRoutineRepository
{
    protected override IQueryable<Routine> GetQuery() =>
        Context.Routines
            .Include(r => r.Exercises)
                .ThenInclude(re => re.Sets);

    public override async Task<Routine?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await GetQuery().FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public override async Task UpdateAsync(Routine routine, CancellationToken cancellationToken)
    {
        var existingExercises = await Context.RoutineExercises
            .Include(re => re.Sets)
            .Where(re => re.RoutineId == routine.Id)
            .ToListAsync(cancellationToken);

        foreach (var exercise in existingExercises)
            Context.RoutineSets.RemoveRange(exercise.Sets);
        Context.RoutineExercises.RemoveRange(existingExercises);

        await base.UpdateAsync(routine, cancellationToken);
    }
}

