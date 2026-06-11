using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IMuscleClassificationService
{
    void ClassifyMuscles(Exercise exercise);
}
