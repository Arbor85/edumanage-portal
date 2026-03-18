using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record UpdatePlanStatusCommand(string PlanId, PlanStatusUpdate Request) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<UpdatePlanStatusCommand, PlanOut>
    {
        public Task<PlanOut> Handle(UpdatePlanStatusCommand request, CancellationToken cancellationToken) =>
            repository.UpdatePlanStatusAsync(request.PlanId, request.Request, cancellationToken);
    }
}