namespace EduManage.Application.Contracts;

public interface IExerciseRepository
{
    Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken);
}
