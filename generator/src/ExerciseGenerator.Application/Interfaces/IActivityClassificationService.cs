using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IActivityClassificationService
{
    void Classify(Exercise exercise);
}
