using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.TrainerAvailability;

public sealed record AddTrainerAvailabilityCommand(string OwnerId, string TrainerUserId, AvailabilityCreate Request) : IRequest<AvailabilityOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ITrainerAvailabilityRepository repo)
        : IRequestHandler<AddTrainerAvailabilityCommand, AvailabilityOut>
    {
        public async Task<AvailabilityOut> Handle(AddTrainerAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var entity = new Domain.Entities.TrainerAvailability
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                TrainerUserId = request.TrainerUserId,
                DaysOfWeek = [.. request.Request.DaysOfWeek],
                StartTime = request.Request.StartTime,
                EndTime = request.Request.EndTime,
                ValidFrom = string.IsNullOrEmpty(request.Request.ValidFrom) ? null : request.Request.ValidFrom,
                ValidTo = string.IsNullOrEmpty(request.Request.ValidTo) ? null : request.Request.ValidTo
            };
            await repo.AddAsync(entity, cancellationToken);
            return new AvailabilityOut(entity.Id, entity.OrganizationId, entity.TrainerUserId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
