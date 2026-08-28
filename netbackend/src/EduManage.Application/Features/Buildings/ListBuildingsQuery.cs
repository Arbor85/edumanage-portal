using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Buildings;

public sealed record ListBuildingsQuery(string OwnerId) : IRequest<IReadOnlyList<BuildingOut>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IBuildingRepository repo)
        : IRequestHandler<ListBuildingsQuery, IReadOnlyList<BuildingOut>>
    {
        public async Task<IReadOnlyList<BuildingOut>> Handle(ListBuildingsQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var items = await repo.ListByOrganizationAsync(org.Id, cancellationToken);
            return items.Select(b => new BuildingOut(b.Id, b.OrganizationId, b.Name, b.Address, b.Capacity)).ToList();
        }
    }
}
