using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Services;

public class TagClassificationService : ITagClassificationService
{
    private static readonly (string Tag, string[] Keywords)[] EquipmentRules =
    [
        ("barbell",    ["barbell", "straight bar", "olympic bar", "ez bar", "ez-bar"]),
        ("dumbbell",   ["dumbbell"]),
        ("kettlebell", ["kettlebell"]),
        ("machine",    ["machine", "lat pulldown", "leg press", "leg extension", "leg curl",
                        "chest press", "shoulder press", "pec deck", "hip adductor", "hip abductor",
                        "cable", "smith machine"]),
        ("bodyweight", ["push-up", "push up", "pull-up", "pull up", "chin-up", "chin up",
                        "dip", "plank", "burpee", "pistol", "l-sit", "handstand", "muscle-up",
                        "muscle up", "air squat", "box jump", "mountain climber", "sit-up",
                        "crunch", "leg raise", "superman", "inverted row", "ring"]),
        ("rings",      ["ring"]),
        ("rope",       ["rope"]),
        ("sled",       ["sled", "prowler"]),
        ("rowing",     ["rowing", "row machine", "erg"]),
        ("running",    ["running", "sprint", "jog", "treadmill"]),
        ("jumping",    ["jump", "box jump", "depth jump", "double under"]),
        ("olympic-lift", ["clean and jerk", "snatch", "power clean", "hang clean", "power snatch",
                          "hang snatch", "clean pull", "snatch pull", "jerk"]),
    ];

    private static readonly (string Tag, string[] Keywords)[] SportRules =
    [
        ("powerlifting",  ["barbell back squat", "barbell bench press", "deadlift", "sumo deadlift"]),
        ("weightlifting", ["clean and jerk", "snatch", "power clean", "hang clean", "power snatch",
                           "hang snatch", "clean pull", "snatch pull", "jerk"]),
        ("crossfit",      ["thruster", "wall ball", "double under", "box jump", "kipping",
                           "toes-to-bar", "toes to bar", "crossfit", "assault bike", "rope climb",
                           "knees-to-elbows"]),
        ("bodybuilding",  ["bicep curl", "tricep", "lateral raise", "chest fly", "cable fly",
                           "concentration curl", "preacher curl", "skull crusher", "kickback",
                           "pec deck", "drag curl"]),
        ("strongman",     ["farmer", "atlas stone", "log press", "tire flip", "yoke", "sandbag",
                           "car deadlift", "axle", "keg", "circus dumbbell"]),
        ("gymnastics",    ["handstand", "l-sit", "planche", "front lever", "back lever",
                           "muscle-up", "muscle up", "ring dip", "ring push", "skin the cat",
                           "human flag", "back tuck", "straddle"]),
        ("mobility",      ["stretch", "mobility", "flexibility", "foam roll", "pigeon", "hip flexor",
                           "child's pose", "cat-cow", "thoracic", "ankle circle"]),
        ("cardio",        ["running", "sprint", "cycling", "rowing machine", "jump rope",
                           "swimming", "walking", "stair", "elliptical", "battle rope",
                           "assault bike", "burpee"]),
    ];

    private static readonly string[] CompoundKeywords =
    [
        "squat", "deadlift", "bench press", "overhead press", " row", "pull-up", "pull up",
        "chin-up", "chin up", "dip", "lunge", "thruster", "clean", "snatch", "jerk",
        "hip thrust", "push-up", "push up", "turkish get-up", "good morning"
    ];

    private static readonly string[] IsolationKeywords =
    [
        "curl", "extension", "lateral raise", "front raise", "fly", "flye", "kickback",
        "crossover", "concentration", "preacher", "skull crusher", "shrug", "calf raise"
    ];

    public void ClassifyTags(Exercise exercise)
    {
        var name = exercise.Name.ToLowerInvariant();
        var tags = new HashSet<string>(exercise.Tags ?? [], StringComparer.OrdinalIgnoreCase);

        foreach (var (tag, keywords) in EquipmentRules)
        {
            if (keywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)))
                tags.Add(tag);
        }

        foreach (var (tag, keywords) in SportRules)
        {
            if (keywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)))
                tags.Add(tag);
        }

        if (CompoundKeywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)))
            tags.Add("compound");
        else if (IsolationKeywords.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase)))
            tags.Add("isolation");

        // Skill level heuristics
        if (name.Contains("snatch") || name.Contains("clean and jerk") ||
            name.Contains("muscle-up") || name.Contains("muscle up") ||
            name.Contains("planche") || name.Contains("front lever") ||
            name.Contains("back lever") || name.Contains("pistol"))
            tags.Add("advanced");
        else if (name.Contains("barbell") || name.Contains("dumbbell") || name.Contains("kettlebell"))
            tags.Add("intermediate");
        else if (tags.Contains("bodyweight") && !tags.Contains("advanced"))
            tags.Add("beginner");

        exercise.Tags = [.. tags.OrderBy(t => t)];
    }
}
