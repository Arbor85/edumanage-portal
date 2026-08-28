using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.TrainerAvailability;

public sealed record ListTrainerAvailabilityQuery(string OwnerId, string TrainerUserId) : IRequest<IReadOnlyList<AvailabilityOut>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ITrainerAvailabilityRepository repo)
        : IRequestHandler<ListTrainerAvailabilityQuery, IReadOnlyList<AvailabilityOut>>
    {
        public async Task<IReadOnlyList<AvailabilityOut>> Handle(ListTrainerAvailabilityQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var items = await repo.ListByTrainerAndOrgAsync(request.TrainerUserId, org.Id, cancellationToken);
            return items.Select(a => new AvailabilityOut(a.Id, a.OrganizationId, a.TrainerUserId, a.DaysOfWeek, a.StartTime, a.EndTime, a.ValidFrom, a.ValidTo)).ToList();
        }
    }
}
