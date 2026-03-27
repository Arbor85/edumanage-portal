using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record GetPlanQuery(string PlanId, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<GetPlanQuery, PlanOut>
    {
        public async Task<PlanOut> Handle(GetPlanQuery request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            var isTrainer = plan.UserId == request.CurrentUserId;
            var isAssignedClient = plan.Client?.UserId == request.CurrentUserId;
            if (!isTrainer && !isAssignedClient)
            {
                throw new UnauthorizedAccessException($"You do not have permission to view plan '{request.PlanId}'.");
            }

            return ListPlansQuery.Handler.MapToOut(plan);
        }
    }
}