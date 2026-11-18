using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IQueuedWorkoutRepository : IRepository<QueuedWorkout, string>
{
    Task<IReadOnlyList<QueuedWorkout>> ListForUserAsync(string userId, CancellationToken cancellationToken);
    Task<bool> DeleteForUserAsync(string id, string userId, CancellationToken cancellationToken);
}
