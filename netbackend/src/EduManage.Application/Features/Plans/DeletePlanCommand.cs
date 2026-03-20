using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record DeletePlanCommand(string PlanId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<DeletePlanCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
        {
            await repository.DeleteByIdAsync(request.PlanId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Plan deleted" };
        }
    }
}