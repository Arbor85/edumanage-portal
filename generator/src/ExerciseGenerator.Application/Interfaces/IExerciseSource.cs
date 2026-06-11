using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IExerciseSource
{
    string SourceName { get; }
    Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default);
}
