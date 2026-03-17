using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class PlanRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), IPlanRepository
{
    public Task<IReadOnlyList<PlanOut>> ListPlansAsync(CancellationToken cancellationToken)
    {
        return ListAsync<PlanOut>(RepositoryCategories.Plans, cancellationToken);
    }

    public async Task<PlanOut> AddPlanAsync(PlanCreate request, CancellationToken cancellationToken)
    {
        var id = NewId();
        var plan = new PlanOut(request.Name, request.ClientId, request.Notes, request.Status, id, ToPlanWorkoutOutput(request.Workouts), await FindClientOrNullAsync(request.ClientId, cancellationToken));
        await SaveAsync(RepositoryCategories.Plans, id, plan, cancellationToken);
        return plan;
    }

    public async Task<PlanOut> GetPlanAsync(string planId, CancellationToken cancellationToken)
    {
        return await GetPlanByIdAsync(planId, cancellationToken);
    }

    public async Task<PlanOut> UpdatePlanAsync(string planId, PlanUpdate request, CancellationToken cancellationToken)
    {
        _ = await GetPlanByIdAsync(planId, cancellationToken);
        var plan = new PlanOut(request.Name, request.ClientId, request.Notes, request.Status, planId, ToPlanWorkoutOutput(request.Workouts), await FindClientOrNullAsync(request.ClientId, cancellationToken));
        await SaveAsync(RepositoryCategories.Plans, planId, plan, cancellationToken);
        return plan;
    }

    public async Task<Dictionary<string, string>> DeletePlanAsync(string planId, CancellationToken cancellationToken)
    {
        var deleted = await DeleteAsync(RepositoryCategories.Plans, planId, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Plan '{planId}' was not found.");
        }

        return new Dictionary<string, string> { ["detail"] = "Plan deleted" };
    }

    public async Task<PlanOut> UpdatePlanStatusAsync(string planId, PlanStatusUpdate request, CancellationToken cancellationToken)
    {
        var existing = await GetPlanByIdAsync(planId, cancellationToken);
        var updated = existing with { Status = request.Status };
        await SaveAsync(RepositoryCategories.Plans, planId, updated, cancellationToken);
        return updated;
    }

    private async Task<PlanOut> GetPlanByIdAsync(string planId, CancellationToken cancellationToken)
    {
        var plan = await FindAsync<PlanOut>(RepositoryCategories.Plans, planId, cancellationToken);
        if (plan is null)
        {
            throw new NotFoundException($"Plan '{planId}' was not found.");
        }

        return plan;
    }

    private Task<ClientOut?> FindClientOrNullAsync(string clientId, CancellationToken cancellationToken)
    {
        return FindAsync<ClientOut>(RepositoryCategories.Clients, clientId, cancellationToken);
    }

    private static IReadOnlyList<PlanWorkoutOutput> ToPlanWorkoutOutput(IReadOnlyList<PlanWorkoutInput> workouts)
    {
        return workouts.Select(workout => new PlanWorkoutOutput(workout.Name, workout.Notes, workout.Id, workout.UserId, workout.Excercises, workout.Date)).ToList();
    }
}
