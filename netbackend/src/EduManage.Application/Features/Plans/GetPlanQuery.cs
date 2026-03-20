using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record GetPlanQuery(string PlanId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<GetPlanQuery, PlanOut>
    {
        public async Task<PlanOut> Handle(GetPlanQuery request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            return ListPlansQuery.Handler.MapToOut(plan);
        }
    }
}