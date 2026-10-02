using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IUserChallengeLogRepository
{
    Task<bool> ExistsAsync(string userId, DateOnly date, CancellationToken cancellationToken);
    Task LogAsync(string userId, DateOnly date, CancellationToken cancellationToken);
}
