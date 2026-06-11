using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Services;

public class ActivityClassificationService : IActivityClassificationService
{
    private static readonly (string ActivityType, string ActivityTrackType, string[] Keywords)[] Rules =
    [
        ("distance",   "distance",    ["running", "sprint", "cycling", "swimming", "walking",
                                       "rowing machine", "elliptical", "ski erg"]),
        ("duration",   "duration",    ["plank", "hold", "wall sit", "static", "l-sit",
                                       "handstand hold", "battle rope", "farmer's walk",
                                       "yoke walk", "sled push", "assault bike", "sandbag carry",
                                       "kettlebell farmers walk", "child's pose", "pigeon",
                                       "hip flexor stretch", "hamstring stretch", "calf stretch",
                                       "thoracic", "cat-cow", "ankle circle", "foam roll"]),
        ("calories",   "calories",    ["assault bike", "air bike"]),
        ("machine",    "repetitions", ["machine", "smith machine"]),
    ];

    private static readonly string[] BodyweightKeywords =
    [
        "push-up", "push up", "pull-up", "pull up", "chin-up", "chin up", "dip", "burpee",
        "pistol squat", "air squat", "mountain climber", "crunch", "sit-up", "sit up",
        "leg raise", "plank", "side plank", "box jump", "jump squat", "muscle-up", "muscle up",
        "toes-to-bar", "toes to bar", "knees-to-elbows", "ring dip", "ring push",
        "handstand push-up", "handstand push up", "l-sit", "human flag", "skin the cat",
        "inverted row", "double under", "jump rope", "rope climb", "superman", "hip extension",
    ];

    public void Classify(Exercise exercise)
    {
        if (!string.IsNullOrWhiteSpace(exercise.ActivityType) &&
            !string.IsNullOrWhiteSpace(exercise.ActivityTrackType))
            return;

        var name = exercise.Name.ToLowerInvariant();
        var tags = exercise.Tags ?? [];

        foreach (var (actType, trackType, keywords) in Rules)
        {
            if (keywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                exercise.ActivityType = actType;
                exercise.ActivityTrackType = trackType;
                return;
            }
        }

        // Bodyweight check
        if (BodyweightKeywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)) &&
            !name.Contains("weighted") && !name.Contains("barbell") && !name.Contains("dumbbell"))
        {
            exercise.ActivityType = "bodyweight";
            exercise.ActivityTrackType = "repetitions";
            return;
        }

        // Default: weighted repetitions
        exercise.ActivityType = "weighted";
        exercise.ActivityTrackType = "repetitions";
    }
}
