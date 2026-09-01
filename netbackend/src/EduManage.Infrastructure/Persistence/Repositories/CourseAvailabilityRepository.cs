using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class CourseAvailabilityRepository(EduManageDbContext context)
    : BaseRepository<CourseAvailability, string>(context), ICourseAvailabilityRepository
{
    public async Task<IReadOnlyList<CourseAvailability>> ListByCourseAsync(string courseId, CancellationToken cancellationToken) =>
        await Context.CourseAvailabilities.Where(a => a.CourseId == courseId).ToListAsync(cancellationToken);
}
