using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record GetPlanQuery(string PlanId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<GetPlanQuery, PlanOut>
    {
        public Task<PlanOut> Handle(GetPlanQuery request, CancellationToken cancellationToken) =>
            repository.GetPlanAsync(request.PlanId, cancellationToken);
    }
}