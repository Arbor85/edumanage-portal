using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.CourseAvailability;

public sealed record DeleteCourseAvailabilityCommand(string AvailabilityId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(ICourseAvailabilityRepository repo) : IRequestHandler<DeleteCourseAvailabilityCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteCourseAvailabilityCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.AvailabilityId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
