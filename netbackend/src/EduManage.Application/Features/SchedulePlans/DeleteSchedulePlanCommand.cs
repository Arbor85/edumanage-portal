using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.SchedulePlans;

public sealed record DeleteSchedulePlanCommand(string PlanId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(ISchedulePlanRepository repo) : IRequestHandler<DeleteSchedulePlanCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteSchedulePlanCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.PlanId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
