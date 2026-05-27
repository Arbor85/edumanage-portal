using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IDefaultWorkoutRepository
{
    Task<IReadOnlyList<DefaultWorkout>> ListAsync(CancellationToken cancellationToken);
    Task<DefaultWorkout?> GetByIdAsync(string id, CancellationToken cancellationToken);
}
