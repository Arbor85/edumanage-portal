using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record ListCoursesQuery : IRequest<IReadOnlyList<CourseOut>>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<ListCoursesQuery, IReadOnlyList<CourseOut>>
    {
        public Task<IReadOnlyList<CourseOut>> Handle(ListCoursesQuery request, CancellationToken cancellationToken) =>
            repository.ListCoursesAsync(cancellationToken);
    }
}