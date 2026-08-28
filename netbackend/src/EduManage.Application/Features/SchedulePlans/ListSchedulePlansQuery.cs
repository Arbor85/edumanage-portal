using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.SchedulePlans;

public sealed record ListSchedulePlansQuery(string OwnerId) : IRequest<IReadOnlyList<SchedulePlanOut>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ISchedulePlanRepository repo)
        : IRequestHandler<ListSchedulePlansQuery, IReadOnlyList<SchedulePlanOut>>
    {
        public async Task<IReadOnlyList<SchedulePlanOut>> Handle(ListSchedulePlansQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var items = await repo.ListByOrganizationAsync(org.Id, cancellationToken);
            return items.Select(p => new SchedulePlanOut(p.Id, p.OrganizationId, p.Name, p.Status, p.CreatedAt)).ToList();
        }
    }
}
