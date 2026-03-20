using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class CourseRepository(EduManageDbContext context)
    : BaseRepository<Course, string>(context), ICourseRepository
{
}
