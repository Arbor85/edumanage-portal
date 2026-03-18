using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record UpdatePlanCommand(string PlanId, PlanUpdate Request) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<UpdatePlanCommand, PlanOut>
    {
        public Task<PlanOut> Handle(UpdatePlanCommand request, CancellationToken cancellationToken) =>
            repository.UpdatePlanAsync(request.PlanId, request.Request, cancellationToken);
    }
}