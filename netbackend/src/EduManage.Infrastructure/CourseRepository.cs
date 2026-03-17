using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class CourseRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), ICourseRepository
{
    public Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken)
    {
        return ListAsync<CourseOut>(RepositoryCategories.Courses, cancellationToken);
    }

    public async Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken)
    {
        var id = NewId();
        var course = new CourseOut(id, "local-user", request.Name, request.Type, request.Size, request.Price, request.Description);
        await SaveAsync(RepositoryCategories.Courses, id, course, cancellationToken);
        return course;
    }

    public async Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken)
    {
        var existing = await FindAsync<CourseOut>(RepositoryCategories.Courses, courseId, cancellationToken);
        if (existing is null)
        {
            throw new NotFoundException($"Course '{courseId}' was not found.");
        }

        var course = new CourseOut(courseId, "local-user", request.Name, request.Type, request.Size, request.Price, request.Description);
        await SaveAsync(RepositoryCategories.Courses, courseId, course, cancellationToken);
        return course;
    }

    public async Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken)
    {
        var deleted = await DeleteAsync(RepositoryCategories.Courses, courseId, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Course '{courseId}' was not found.");
        }

        return new Dictionary<string, string> { ["detail"] = "Course deleted" };
    }
}
