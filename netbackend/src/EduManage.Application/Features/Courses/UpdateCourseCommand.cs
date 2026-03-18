using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record UpdateCourseCommand(string CourseId, CourseUpdate Request) : IRequest<CourseOut>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<UpdateCourseCommand, CourseOut>
    {
        public Task<CourseOut> Handle(UpdateCourseCommand request, CancellationToken cancellationToken) =>
            repository.UpdateCourseAsync(request.CourseId, request.Request, cancellationToken);
    }
}