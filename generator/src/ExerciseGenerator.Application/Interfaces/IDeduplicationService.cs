using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IDeduplicationService
{
    IReadOnlyList<Exercise> Deduplicate(IEnumerable<Exercise> exercises, out int duplicatesRemoved);
}
