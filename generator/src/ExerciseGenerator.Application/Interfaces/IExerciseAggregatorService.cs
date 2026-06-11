using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IExerciseAggregatorService
{
    Task<(IReadOnlyList<Exercise> Exercises, Report Report)> AggregateAsync(CancellationToken cancellationToken = default);
}
