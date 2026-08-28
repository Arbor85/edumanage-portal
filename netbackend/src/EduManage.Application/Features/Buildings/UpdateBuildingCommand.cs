using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Buildings;

public sealed record UpdateBuildingCommand(string BuildingId, BuildingUpdate Request) : IRequest<BuildingOut>
{
    internal sealed class Handler(IBuildingRepository repo) : IRequestHandler<UpdateBuildingCommand, BuildingOut>
    {
        public async Task<BuildingOut> Handle(UpdateBuildingCommand request, CancellationToken cancellationToken)
        {
            var building = await repo.GetByIdAsync(request.BuildingId, cancellationToken)
                ?? throw new NotFoundException($"Building '{request.BuildingId}' not found.");
            building.Name = request.Request.Name;
            building.Address = request.Request.Address;
            building.Capacity = request.Request.Capacity;
            await repo.UpdateAsync(building, cancellationToken);
            return new BuildingOut(building.Id, building.OrganizationId, building.Name, building.Address, building.Capacity);
        }
    }
}
