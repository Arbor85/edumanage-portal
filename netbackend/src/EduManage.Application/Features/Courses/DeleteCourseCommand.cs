using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record DeleteCourseCommand(string CourseId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<DeleteCourseCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
        {
            await repository.DeleteByIdAsync(request.CourseId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Course deleted" };
        }
    }
}