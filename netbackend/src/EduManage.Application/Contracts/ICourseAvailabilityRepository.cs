using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface ICourseAvailabilityRepository : IRepository<CourseAvailability, string>
{
    Task<IReadOnlyList<CourseAvailability>> ListByCourseAsync(string courseId, CancellationToken cancellationToken);
}
