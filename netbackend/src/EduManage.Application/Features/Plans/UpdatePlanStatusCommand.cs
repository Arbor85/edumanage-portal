using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record UpdatePlanStatusCommand(string PlanId, PlanStatusUpdate Request, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<UpdatePlanStatusCommand, PlanOut>
    {
        public async Task<PlanOut> Handle(UpdatePlanStatusCommand request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            if (plan.UserId != request.CurrentUserId)
            {
                throw new UnauthorizedAccessException($"You do not have permission to update status for plan '{request.PlanId}'.");
            }

            plan.Status = request.Request.Status;

            await repository.UpdateAsync(plan, cancellationToken);
            return ListPlansQuery.Handler.MapToOut(plan);
        }
    }
}