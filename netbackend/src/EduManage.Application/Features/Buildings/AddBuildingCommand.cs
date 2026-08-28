using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Buildings;

public sealed record AddBuildingCommand(string OwnerId, BuildingCreate Request) : IRequest<BuildingOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IBuildingRepository repo)
        : IRequestHandler<AddBuildingCommand, BuildingOut>
    {
        public async Task<BuildingOut> Handle(AddBuildingCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var building = new Building
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                Name = request.Request.Name,
                Address = request.Request.Address,
                Capacity = request.Request.Capacity
            };
            await repo.AddAsync(building, cancellationToken);
            return new BuildingOut(building.Id, building.OrganizationId, building.Name, building.Address, building.Capacity);
        }
    }
}
