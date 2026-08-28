using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.BuildingAvailability;

public sealed record ListBuildingAvailabilityQuery(string BuildingId) : IRequest<IReadOnlyList<BuildingAvailabilityOut>>
{
    internal sealed class Handler(IBuildingAvailabilityRepository repo) : IRequestHandler<ListBuildingAvailabilityQuery, IReadOnlyList<BuildingAvailabilityOut>>
    {
        public async Task<IReadOnlyList<BuildingAvailabilityOut>> Handle(ListBuildingAvailabilityQuery request, CancellationToken cancellationToken)
        {
            var items = await repo.ListByBuildingAsync(request.BuildingId, cancellationToken);
            return items.Select(a => new BuildingAvailabilityOut(a.Id, a.BuildingId, a.DaysOfWeek, a.StartTime, a.EndTime, a.ValidFrom, a.ValidTo)).ToList();
        }
    }
}
