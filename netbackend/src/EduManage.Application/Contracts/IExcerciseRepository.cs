namespace EduManage.Application.Contracts;

public interface IExcerciseRepository
{
    Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken);
}
