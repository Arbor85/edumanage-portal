using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class UserChallengeLogRepository(EduManageDbContext context) : IUserChallengeLogRepository
{
    public Task<bool> ExistsAsync(string userId, DateOnly date, CancellationToken cancellationToken) =>
        context.UserChallengeLogs.AnyAsync(x => x.UserId == userId && x.ChallengeDate == date, cancellationToken);

    public async Task LogAsync(string userId, DateOnly date, CancellationToken cancellationToken)
    {
        context.UserChallengeLogs.Add(new UserChallengeLog { UserId = userId, ChallengeDate = date });
        await context.SaveChangesAsync(cancellationToken);
    }
}
