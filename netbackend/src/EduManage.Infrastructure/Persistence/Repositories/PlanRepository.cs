using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class PlanRepository(EduManageDbContext context)
    : BaseRepository<Plan, string>(context), IPlanRepository
{
    protected override IQueryable<Plan> GetQuery() =>
        Context.Plans
            .Include(p => p.Client)
            .Include(p => p.Workouts)
                .ThenInclude(pw => pw.Exercises)
                    .ThenInclude(re => re.Sets);

    public override async Task<Plan?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await GetQuery().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public override async Task UpdateAsync(Plan plan, CancellationToken cancellationToken)
    {
        var existingWorkouts = await Context.PlanWorkouts
            .Include(pw => pw.Exercises)
                .ThenInclude(re => re.Sets)
            .Where(pw => pw.PlanId == plan.Id)
            .ToListAsync(cancellationToken);

        foreach (var workout in existingWorkouts)
        {
            foreach (var exercise in workout.Exercises)
                Context.RoutineSets.RemoveRange(exercise.Sets);
            Context.RoutineExercises.RemoveRange(workout.Exercises);
        }
        Context.PlanWorkouts.RemoveRange(existingWorkouts);

        await base.UpdateAsync(plan, cancellationToken);
    }
}