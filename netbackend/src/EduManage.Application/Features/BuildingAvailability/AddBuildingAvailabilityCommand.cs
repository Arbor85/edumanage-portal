using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.BuildingAvailability;

public sealed record AddBuildingAvailabilityCommand(string BuildingId, BuildingAvailabilityCreate Request) : IRequest<BuildingAvailabilityOut>
{
    internal sealed class Handler(IBuildingAvailabilityRepository repo) : IRequestHandler<AddBuildingAvailabilityCommand, BuildingAvailabilityOut>
    {
        public async Task<BuildingAvailabilityOut> Handle(AddBuildingAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var entity = new Domain.Entities.BuildingAvailability
            {
                Id = Guid.NewGuid().ToString("N"),
                BuildingId = request.BuildingId,
                DaysOfWeek = [.. request.Request.DaysOfWeek],
                StartTime = request.Request.StartTime,
                EndTime = request.Request.EndTime,
                ValidFrom = request.Request.ValidFrom,
                ValidTo = request.Request.ValidTo
            };
            await repo.AddAsync(entity, cancellationToken);
            return new BuildingAvailabilityOut(entity.Id, entity.BuildingId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
