namespace EduManage.Application.Contracts;

public interface IExerciseRepository
{
    Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken);
    Task<ExcerciseOut> AddExcerciseAsync(ExcerciseWriteRequest request, CancellationToken cancellationToken);
    Task<ExcerciseOut> UpdateExcerciseAsync(int id, ExcerciseWriteRequest request, CancellationToken cancellationToken);
    Task DeleteExcerciseAsync(int id, CancellationToken cancellationToken);
}
