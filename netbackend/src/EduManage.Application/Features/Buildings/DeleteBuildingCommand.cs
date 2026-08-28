using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Buildings;

public sealed record DeleteBuildingCommand(string BuildingId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IBuildingRepository repo) : IRequestHandler<DeleteBuildingCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteBuildingCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.BuildingId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
