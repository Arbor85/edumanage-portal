using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Services;

public class MuscleClassificationService : IMuscleClassificationService
{
    private static readonly (string Keyword, string Primary, string[] Secondary)[] KeywordMap =
    [
        // Legs
        ("squat",              "Quadriceps",         ["Gluteus Maximus", "Hamstrings", "Core"]),
        ("leg press",          "Quadriceps",         ["Gluteus Maximus", "Hamstrings"]),
        ("leg extension",      "Quadriceps",         []),
        ("lunge",              "Quadriceps",         ["Gluteus Maximus", "Hamstrings"]),
        ("bulgarian split",    "Quadriceps",         ["Gluteus Maximus", "Hamstrings"]),
        ("split squat",        "Quadriceps",         ["Gluteus Maximus", "Hamstrings"]),
        ("step up",            "Quadriceps",         ["Gluteus Maximus"]),
        ("leg curl",           "Hamstrings",         ["Gluteus Maximus"]),
        ("romanian deadlift",  "Hamstrings",         ["Gluteus Maximus", "Lower Back"]),
        ("good morning",       "Hamstrings",         ["Lower Back", "Gluteus Maximus"]),
        ("deadlift",           "Hamstrings",         ["Gluteus Maximus", "Lower Back", "Trapezius"]),
        ("hip thrust",         "Gluteus Maximus",    ["Hamstrings", "Core"]),
        ("glute bridge",       "Gluteus Maximus",    ["Hamstrings"]),
        ("calf raise",         "Gastrocnemius",      ["Soleus"]),
        ("tibialis raise",     "Tibialis Anterior",  []),
        ("nordic",             "Hamstrings",         ["Gluteus Maximus"]),
        // Back
        ("pull-up",            "Latissimus Dorsi",   ["Biceps", "Rhomboids"]),
        ("pull up",            "Latissimus Dorsi",   ["Biceps", "Rhomboids"]),
        ("chin-up",            "Latissimus Dorsi",   ["Biceps"]),
        ("chin up",            "Latissimus Dorsi",   ["Biceps"]),
        ("lat pulldown",       "Latissimus Dorsi",   ["Biceps", "Rhomboids"]),
        ("cable row",          "Latissimus Dorsi",   ["Rhomboids", "Biceps"]),
        ("bent-over row",      "Latissimus Dorsi",   ["Rhomboids", "Biceps"]),
        ("pendlay row",        "Latissimus Dorsi",   ["Rhomboids"]),
        ("inverted row",       "Latissimus Dorsi",   ["Biceps", "Rhomboids"]),
        ("t-bar row",          "Latissimus Dorsi",   ["Rhomboids", "Biceps"]),
        ("barbell row",        "Latissimus Dorsi",   ["Rhomboids", "Biceps"]),
        ("dumbbell row",       "Latissimus Dorsi",   ["Rhomboids", "Biceps"]),
        ("shrug",              "Trapezius",          []),
        ("face pull",          "Posterior Deltoid",  ["Trapezius", "Rhomboids"]),
        ("back extension",     "Erector Spinae",     ["Gluteus Maximus"]),
        ("hyperextension",     "Erector Spinae",     ["Gluteus Maximus"]),
        ("superman",           "Erector Spinae",     ["Gluteus Maximus"]),
        ("skin the cat",       "Latissimus Dorsi",   ["Biceps"]),
        ("front lever",        "Latissimus Dorsi",   ["Core", "Biceps"]),
        ("back lever",         "Pectoralis Minor",   ["Biceps", "Core"]),
        // Chest
        ("bench press",        "Pectoralis Major",   ["Anterior Deltoid", "Triceps"]),
        ("floor press",        "Pectoralis Major",   ["Triceps", "Anterior Deltoid"]),
        ("push-up",            "Pectoralis Major",   ["Anterior Deltoid", "Triceps"]),
        ("push up",            "Pectoralis Major",   ["Anterior Deltoid", "Triceps"]),
        ("chest fly",          "Pectoralis Major",   ["Anterior Deltoid"]),
        ("chest press",        "Pectoralis Major",   ["Anterior Deltoid", "Triceps"]),
        ("cable fly",          "Pectoralis Major",   ["Anterior Deltoid"]),
        ("cable crossover",    "Pectoralis Major",   ["Anterior Deltoid"]),
        ("pec deck",           "Pectoralis Major",   []),
        ("dip",                "Triceps",            ["Pectoralis Major", "Anterior Deltoid"]),
        ("planche",            "Pectoralis Major",   ["Anterior Deltoid", "Core"]),
        // Shoulders
        ("overhead press",     "Anterior Deltoid",   ["Medial Deltoid", "Trapezius"]),
        ("shoulder press",     "Anterior Deltoid",   ["Medial Deltoid"]),
        ("arnold press",       "Anterior Deltoid",   ["Medial Deltoid"]),
        ("push press",         "Anterior Deltoid",   ["Quadriceps", "Medial Deltoid"]),
        ("lateral raise",      "Medial Deltoid",     []),
        ("front raise",        "Anterior Deltoid",   []),
        ("reverse fly",        "Posterior Deltoid",  ["Rhomboids"]),
        ("upright row",        "Trapezius",          ["Medial Deltoid"]),
        ("pike push-up",       "Anterior Deltoid",   ["Triceps"]),
        ("pike push up",       "Anterior Deltoid",   ["Triceps"]),
        ("handstand push-up",  "Anterior Deltoid",   ["Trapezius", "Triceps"]),
        ("handstand",          "Anterior Deltoid",   ["Core", "Trapezius"]),
        // Arms
        ("bicep curl",         "Biceps",             ["Forearms"]),
        ("hammer curl",        "Biceps",             ["Brachialis"]),
        ("drag curl",          "Biceps",             []),
        ("concentration curl", "Biceps",             []),
        ("preacher curl",      "Biceps",             []),
        ("tricep",             "Triceps",            []),
        ("skull crusher",      "Triceps",            []),
        ("close grip bench",   "Triceps",            ["Pectoralis Major"]),
        ("diamond push",       "Triceps",            ["Pectoralis Major"]),
        ("farmer",             "Forearms",           ["Trapezius", "Core"]),
        // Core
        ("plank",              "Core",               ["Shoulder Girdle"]),
        ("side plank",         "Obliques",           ["Core"]),
        ("sit-up",             "Rectus Abdominis",   ["Hip Flexors"]),
        ("sit up",             "Rectus Abdominis",   ["Hip Flexors"]),
        ("crunch",             "Rectus Abdominis",   ["Obliques"]),
        ("leg raise",          "Rectus Abdominis",   ["Hip Flexors"]),
        ("toes-to-bar",        "Rectus Abdominis",   ["Hip Flexors", "Core"]),
        ("toes to bar",        "Rectus Abdominis",   ["Hip Flexors", "Core"]),
        ("knees-to-elbows",    "Rectus Abdominis",   ["Hip Flexors"]),
        ("ab wheel",           "Rectus Abdominis",   ["Core"]),
        ("l-sit",              "Rectus Abdominis",   ["Hip Flexors", "Core"]),
        ("dragon flag",        "Rectus Abdominis",   ["Core"]),
        ("mountain climber",   "Core",               ["Shoulders"]),
        ("turkish get-up",     "Core",               ["Shoulder Girdle", "Gluteus Maximus"]),
        ("windmill",           "Core",               ["Obliques", "Shoulder Girdle"]),
        // Olympic / Full Body
        ("clean and jerk",     "Quadriceps",         ["Posterior Chain", "Anterior Deltoid"]),
        ("power clean",        "Quadriceps",         ["Posterior Chain", "Trapezius"]),
        ("hang clean",         "Quadriceps",         ["Hamstrings", "Trapezius"]),
        ("snatch",             "Posterior Chain",    ["Quadriceps", "Trapezius", "Core"]),
        ("thruster",           "Quadriceps",         ["Anterior Deltoid", "Gluteus Maximus"]),
        ("wall ball",          "Quadriceps",         ["Anterior Deltoid", "Core"]),
        ("kettlebell swing",   "Hamstrings",         ["Gluteus Maximus", "Core"]),
        ("tire flip",          "Hamstrings",         ["Gluteus Maximus", "Core"]),
        ("rope climb",         "Biceps",             ["Latissimus Dorsi", "Core"]),
        ("muscle-up",          "Triceps",            ["Latissimus Dorsi", "Core"]),
        ("muscle up",          "Triceps",            ["Latissimus Dorsi", "Core"]),
        ("burpee",             "Full Body",          ["Cardiovascular"]),
        ("box jump",           "Quadriceps",         ["Gluteus Maximus", "Calves"]),
        ("double under",       "Calves",             ["Cardiovascular"]),
        ("battle rope",        "Shoulders",          ["Core", "Cardiovascular"]),
        ("rowing",             "Latissimus Dorsi",   ["Core", "Legs", "Biceps"]),
        ("running",            "Cardiovascular",     ["Quadriceps", "Hamstrings", "Calves"]),
        ("sprint",             "Cardiovascular",     ["Quadriceps", "Hamstrings"]),
        ("cycling",            "Cardiovascular",     ["Quadriceps"]),
        ("swimming",           "Cardiovascular",     ["Full Body"]),
        ("jump rope",          "Cardiovascular",     ["Calves"]),
        ("walking",            "Cardiovascular",     ["Quadriceps"]),
        ("stair",              "Quadriceps",         ["Cardiovascular", "Gluteus Maximus"]),
        // Mobility
        ("hip flexor stretch", "Hip Flexors",        []),
        ("pigeon",             "Gluteus Maximus",    ["Hip Flexors"]),
        ("thoracic",           "Thoracic Spine",     []),
        ("cat-cow",            "Spine",              []),
        ("cat cow",            "Spine",              []),
        ("shoulder dislocate", "Shoulder Girdle",    []),
        ("hamstring stretch",  "Hamstrings",         []),
        ("calf stretch",       "Gastrocnemius",      []),
        ("child's pose",       "Spine",              ["Core"]),
        ("foam roll",          "Full Body",          []),
        ("hip circle",         "Hip Flexors",        ["Gluteus Maximus"]),
        ("ankle circle",       "Ankle",              []),
    ];

    private static readonly Dictionary<string, (string Primary, string[] Secondary)> CategoryFallback =
        new(StringComparer.OrdinalIgnoreCase)
    {
        ["Abs"]       = ("Rectus Abdominis", ["Obliques", "Core"]),
        ["Arms"]      = ("Biceps",           ["Triceps"]),
        ["Back"]      = ("Latissimus Dorsi", ["Trapezius", "Rhomboids"]),
        ["Calves"]    = ("Gastrocnemius",    ["Soleus"]),
        ["Chest"]     = ("Pectoralis Major", ["Anterior Deltoid", "Triceps"]),
        ["Legs"]      = ("Quadriceps",       ["Hamstrings", "Gluteus Maximus"]),
        ["Shoulders"] = ("Anterior Deltoid", ["Medial Deltoid", "Trapezius"]),
    };

    public void ClassifyMuscles(Exercise exercise)
    {
        if (!string.IsNullOrWhiteSpace(exercise.PrimaryMuscle))
        {
            // Ensure Muscles list is consistent with PrimaryMuscle
            if (exercise.Muscles.Count == 0)
            {
                exercise.Muscles = [new Muscle { Name = exercise.PrimaryMuscle }];
                foreach (var m in exercise.SecondaryMuscles)
                    exercise.Muscles.Add(new Muscle { Name = m });
            }
            return;
        }

        var name = exercise.Name.ToLowerInvariant();

        foreach (var (keyword, primary, secondary) in KeywordMap)
        {
            if (name.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                ApplyMuscles(exercise, primary, secondary);
                return;
            }
        }

        // Fallback to "Full Body"
        ApplyMuscles(exercise, "Full Body", []);
    }

    private static void ApplyMuscles(Exercise exercise, string primary, string[] secondary)
    {
        exercise.PrimaryMuscle = primary;
        exercise.SecondaryMuscles = [.. secondary];
        exercise.Muscles = [new Muscle { Name = primary }];
        foreach (var m in secondary)
            exercise.Muscles.Add(new Muscle { Name = m });
    }
}
