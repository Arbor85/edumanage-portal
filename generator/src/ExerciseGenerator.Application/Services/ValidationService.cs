using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Services;

public class ValidationService : IValidationService
{
    private static readonly HashSet<string> ValidActivityTypes =
        ["weighted", "bodyweight", "distance", "duration", "calories", "machine"];

    private static readonly HashSet<string> ValidActivityTrackTypes =
        ["repetitions", "distance", "duration", "calories"];

    public bool IsValid(Exercise exercise, out string? error)
    {
        if (string.IsNullOrWhiteSpace(exercise.Name))
        {
            error = "Name is empty";
            return false;
        }

        if (string.IsNullOrWhiteSpace(exercise.PrimaryMuscle))
        {
            error = "PrimaryMuscle is empty";
            return false;
        }

        if (string.IsNullOrWhiteSpace(exercise.ActivityType))
        {
            error = "ActivityType is empty";
            return false;
        }

        if (!ValidActivityTypes.Contains(exercise.ActivityType))
        {
            error = $"ActivityType '{exercise.ActivityType}' is not valid";
            return false;
        }

        if (string.IsNullOrWhiteSpace(exercise.ActivityTrackType))
        {
            error = "ActivityTrackType is empty";
            return false;
        }

        if (!ValidActivityTrackTypes.Contains(exercise.ActivityTrackType))
        {
            error = $"ActivityTrackType '{exercise.ActivityTrackType}' is not valid";
            return false;
        }

        error = null;
        return true;
    }
}
