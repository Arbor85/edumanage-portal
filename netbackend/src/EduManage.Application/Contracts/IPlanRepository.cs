namespace EduManage.Application.Contracts;

public interface IPlanRepository
{
    Task<IReadOnlyList<PlanOut>> ListPlansAsync(CancellationToken cancellationToken);
    Task<PlanOut> AddPlanAsync(PlanCreate request, CancellationToken cancellationToken);
    Task<PlanOut> GetPlanAsync(string planId, CancellationToken cancellationToken);
    Task<PlanOut> UpdatePlanAsync(string planId, PlanUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeletePlanAsync(string planId, CancellationToken cancellationToken);
    Task<PlanOut> UpdatePlanStatusAsync(string planId, PlanStatusUpdate request, CancellationToken cancellationToken);
}
