using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class MeetingRepository(EduManageDbContext context)
    : BaseRepository<Meeting, string>(context), IMeetingRepository
{
}
