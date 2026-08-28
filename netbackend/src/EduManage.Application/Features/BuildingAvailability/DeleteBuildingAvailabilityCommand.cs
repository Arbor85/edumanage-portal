using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.BuildingAvailability;

public sealed record DeleteBuildingAvailabilityCommand(string AvailabilityId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IBuildingAvailabilityRepository repo) : IRequestHandler<DeleteBuildingAvailabilityCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteBuildingAvailabilityCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.AvailabilityId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
