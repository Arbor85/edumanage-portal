using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.TrainerAvailability;

public sealed record UpdateTrainerAvailabilityCommand(string AvailabilityId, AvailabilityUpdate Request) : IRequest<AvailabilityOut>
{
    internal sealed class Handler(ITrainerAvailabilityRepository repo) : IRequestHandler<UpdateTrainerAvailabilityCommand, AvailabilityOut>
    {
        public async Task<AvailabilityOut> Handle(UpdateTrainerAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var entity = await repo.GetByIdAsync(request.AvailabilityId, cancellationToken)
                ?? throw new NotFoundException($"Availability '{request.AvailabilityId}' not found.");
            entity.DaysOfWeek = [.. request.Request.DaysOfWeek];
            entity.StartTime = request.Request.StartTime;
            entity.EndTime = request.Request.EndTime;
            entity.ValidFrom = string.IsNullOrEmpty(request.Request.ValidFrom) ? null : request.Request.ValidFrom;
            entity.ValidTo = string.IsNullOrEmpty(request.Request.ValidTo) ? null : request.Request.ValidTo;
            await repo.UpdateAsync(entity, cancellationToken);
            return new AvailabilityOut(entity.Id, entity.OrganizationId, entity.TrainerUserId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
