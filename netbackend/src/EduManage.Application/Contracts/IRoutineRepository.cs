namespace EduManage.Application.Contracts;

public interface IRoutineRepository
{
    Task<IReadOnlyList<RoutineOut>> ListRoutinesAsync(CancellationToken cancellationToken);
    Task<RoutineOut> AddRoutineAsync(RoutineCreate request, CancellationToken cancellationToken);
    Task<RoutineOut> UpdateRoutineAsync(string routineId, RoutineUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteRoutineAsync(string routineId, CancellationToken cancellationToken);
}
