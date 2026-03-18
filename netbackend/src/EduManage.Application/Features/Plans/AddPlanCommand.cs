using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record AddPlanCommand(PlanCreate Request) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<AddPlanCommand, PlanOut>
    {
        public Task<PlanOut> Handle(AddPlanCommand request, CancellationToken cancellationToken) =>
            repository.AddPlanAsync(request.Request, cancellationToken);
    }
}