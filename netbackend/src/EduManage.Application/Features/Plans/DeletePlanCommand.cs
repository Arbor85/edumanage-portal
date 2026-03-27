using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record DeletePlanCommand(string PlanId, string CurrentUserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<DeletePlanCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            if (plan.UserId != request.CurrentUserId)
            {
                throw new UnauthorizedAccessException($"You do not have permission to delete plan '{request.PlanId}'.");
            }

            await repository.DeleteByIdAsync(request.PlanId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Plan deleted" };
        }
    }
}