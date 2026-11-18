using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class QueuedWorkoutRepository(EduManageDbContext context)
    : BaseRepository<QueuedWorkout, string>(context), IQueuedWorkoutRepository
{
    public async Task<IReadOnlyList<QueuedWorkout>> ListForUserAsync(string userId, CancellationToken cancellationToken) =>
        await Context.QueuedWorkouts
            .Where(q => q.UserId == userId)
            .OrderBy(q => q.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<bool> DeleteForUserAsync(string id, string userId, CancellationToken cancellationToken)
    {
        var entity = await Context.QueuedWorkouts
            .FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId, cancellationToken);
        if (entity is null) return false;
        Context.QueuedWorkouts.Remove(entity);
        await Context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
