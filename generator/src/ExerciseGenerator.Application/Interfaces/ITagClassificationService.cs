using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface ITagClassificationService
{
    void ClassifyTags(Exercise exercise);
}
