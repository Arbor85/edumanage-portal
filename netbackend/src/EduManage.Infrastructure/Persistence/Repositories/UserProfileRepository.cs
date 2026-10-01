using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class UserProfileRepository(EduManageDbContext context)
    : BaseRepository<UserProfile, string>(context), IUserProfileRepository
{
}
