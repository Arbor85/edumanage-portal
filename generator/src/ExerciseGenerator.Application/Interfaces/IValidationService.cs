using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Interfaces;

public interface IValidationService
{
    bool IsValid(Exercise exercise, out string? error);
}
