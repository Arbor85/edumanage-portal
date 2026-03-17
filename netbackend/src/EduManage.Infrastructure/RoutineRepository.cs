using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class RoutineRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), IRoutineRepository
{
    public Task<IReadOnlyList<RoutineOut>> ListRoutinesAsync(CancellationToken cancellationToken)
    {
        return ListAsync<RoutineOut>(RepositoryCategories.Routines, cancellationToken);
    }

    public async Task<RoutineOut> AddRoutineAsync(RoutineCreate request, CancellationToken cancellationToken)
    {
        var id = NewId();
        var routine = new RoutineOut(request.Name, request.Notes, id, "local-user", request.Excercises);
        await SaveAsync(RepositoryCategories.Routines, id, routine, cancellationToken);
        return routine;
    }

    public async Task<RoutineOut> UpdateRoutineAsync(string routineId, RoutineUpdate request, CancellationToken cancellationToken)
    {
        var existing = await FindAsync<RoutineOut>(RepositoryCategories.Routines, routineId, cancellationToken);
        if (existing is null)
        {
            throw new NotFoundException($"Routine '{routineId}' was not found.");
        }

        var routine = new RoutineOut(request.Name, request.Notes, routineId, "local-user", request.Excercises);
        await SaveAsync(RepositoryCategories.Routines, routineId, routine, cancellationToken);
        return routine;
    }

    public async Task<Dictionary<string, string>> DeleteRoutineAsync(string routineId, CancellationToken cancellationToken)
    {
        var deleted = await DeleteAsync(RepositoryCategories.Routines, routineId, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Routine '{routineId}' was not found.");
        }

        return new Dictionary<string, string> { ["detail"] = "Routine deleted" };
    }

    public async Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken)
    {
        var excercises = request.Excercises?.Count > 0
            ? request.Excercises
            : request.Exercises ?? [];

        var completed = new WorkoutHistoryOut(
            NewId(),
            "local-user",
            request.Mode,
            request.StartedAt,
            request.CompletedAt,
            request.DurationSeconds,
            request.TotalSets,
            request.CompletedSets,
            excercises,
            request.SourceWorkout);

        await SaveAsync(RepositoryCategories.WorkoutHistory, completed.Id, completed, cancellationToken);
        return completed;
    }
}
