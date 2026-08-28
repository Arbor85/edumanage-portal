using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.BuildingAvailability;

public sealed record UpdateBuildingAvailabilityCommand(string AvailabilityId, BuildingAvailabilityUpdate Request) : IRequest<BuildingAvailabilityOut>
{
    internal sealed class Handler(IBuildingAvailabilityRepository repo) : IRequestHandler<UpdateBuildingAvailabilityCommand, BuildingAvailabilityOut>
    {
        public async Task<BuildingAvailabilityOut> Handle(UpdateBuildingAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var entity = await repo.GetByIdAsync(request.AvailabilityId, cancellationToken)
                ?? throw new NotFoundException($"Availability '{request.AvailabilityId}' not found.");
            entity.DaysOfWeek = [.. request.Request.DaysOfWeek];
            entity.StartTime = request.Request.StartTime;
            entity.EndTime = request.Request.EndTime;
            entity.ValidFrom = request.Request.ValidFrom;
            entity.ValidTo = request.Request.ValidTo;
            await repo.UpdateAsync(entity, cancellationToken);
            return new BuildingAvailabilityOut(entity.Id, entity.BuildingId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
