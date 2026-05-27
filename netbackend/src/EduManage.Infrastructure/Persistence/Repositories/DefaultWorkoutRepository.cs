using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class DefaultWorkoutRepository(EduManageDbContext context) : IDefaultWorkoutRepository
{
    public async Task<IReadOnlyList<DefaultWorkout>> ListAsync(CancellationToken cancellationToken) =>
        await context.DefaultWorkouts
            .AsNoTracking()
            .Include(defaultWorkout => defaultWorkout.Exercises)
                .ThenInclude(defaultWorkoutExercise => defaultWorkoutExercise.Sets)
            .OrderBy(defaultWorkout => defaultWorkout.Name)
            .ToListAsync(cancellationToken);

    public async Task<DefaultWorkout?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await context.DefaultWorkouts
            .AsNoTracking()
            .Include(defaultWorkout => defaultWorkout.Exercises)
                .ThenInclude(defaultWorkoutExercise => defaultWorkoutExercise.Sets)
            .FirstOrDefaultAsync(defaultWorkout => defaultWorkout.Id == id, cancellationToken);
}
