using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IDescriptionGeneratorService
{
    void GenerateDescription(Exercise exercise);
}
