using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record DeletePlanCommand(string PlanId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<DeletePlanCommand, Dictionary<string, string>>
    {
        public Task<Dictionary<string, string>> Handle(DeletePlanCommand request, CancellationToken cancellationToken) =>
            repository.DeletePlanAsync(request.PlanId, cancellationToken);
    }
}