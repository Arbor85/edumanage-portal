using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record AddCourseCommand(CourseCreate Request) : IRequest<CourseOut>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<AddCourseCommand, CourseOut>
    {
        public Task<CourseOut> Handle(AddCourseCommand request, CancellationToken cancellationToken) =>
            repository.AddCourseAsync(request.Request, cancellationToken);
    }
}