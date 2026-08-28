using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.SchedulePlans;

public sealed record UnpublishSchedulePlanCommand(string PlanId) : IRequest<SchedulePlanOut>
{
    internal sealed class Handler(ISchedulePlanRepository repo) : IRequestHandler<UnpublishSchedulePlanCommand, SchedulePlanOut>
    {
        public async Task<SchedulePlanOut> Handle(UnpublishSchedulePlanCommand request, CancellationToken cancellationToken)
        {
            var plan = await repo.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Schedule plan '{request.PlanId}' not found.");
            plan.Status = "Draft";
            await repo.UpdateAsync(plan, cancellationToken);
            return new SchedulePlanOut(plan.Id, plan.OrganizationId, plan.Name, plan.Status, plan.CreatedAt);
        }
    }
}
