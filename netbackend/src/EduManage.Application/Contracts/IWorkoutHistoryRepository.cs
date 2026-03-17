namespace EduManage.Application.Contracts;

public interface IWorkoutHistoryRepository
{
    Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken);
}
