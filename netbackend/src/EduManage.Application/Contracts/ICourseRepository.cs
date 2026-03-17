namespace EduManage.Application.Contracts;

public interface ICourseRepository
{
    Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken);
    Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken);
    Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken);
}
