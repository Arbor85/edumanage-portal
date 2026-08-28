using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.SchedulePlans;

public sealed record AddSchedulePlanCommand(string OwnerId, SchedulePlanCreate Request) : IRequest<SchedulePlanOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ISchedulePlanRepository repo)
        : IRequestHandler<AddSchedulePlanCommand, SchedulePlanOut>
    {
        public async Task<SchedulePlanOut> Handle(AddSchedulePlanCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var plan = new SchedulePlan
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                Name = request.Request.Name,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            await repo.AddAsync(plan, cancellationToken);
            return new SchedulePlanOut(plan.Id, plan.OrganizationId, plan.Name, plan.Status, plan.CreatedAt);
        }
    }
}
