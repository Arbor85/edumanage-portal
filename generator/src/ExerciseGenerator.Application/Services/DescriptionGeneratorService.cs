using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using System.Text.RegularExpressions;

namespace ExerciseGenerator.Application.Services;

public partial class DescriptionGeneratorService : IDescriptionGeneratorService
{
    private const int MaxLength = 300;

    private static readonly Dictionary<string, string> KnownDescriptions =
        new(StringComparer.OrdinalIgnoreCase)
    {
        ["Barbell Back Squat"]         = "Stand with feet shoulder-width apart, bar resting on upper traps. Descend by pushing hips back and bending knees until thighs are parallel to the floor, then drive back up.",
        ["Barbell Front Squat"]        = "Hold bar in front rack position across front deltoids. Keep torso upright, descend until thighs are parallel, then drive through heels to stand.",
        ["Barbell Deadlift"]           = "Stand hip-width apart, bar over mid-foot. Grip just outside legs, brace core, push the floor away until hips and knees lock out fully.",
        ["Deadlift"]                   = "Stand hip-width apart, bar over mid-foot. Grip just outside legs, brace core, push the floor away until hips and knees lock out fully.",
        ["Sumo Deadlift"]              = "Stand with wide stance, toes flared. Grip bar between legs, keep chest up, drive hips forward as you extend to lockout.",
        ["Romanian Deadlift"]          = "Hold bar at hips, soft knee bend. Hinge at hips pushing them back, lower bar along thighs until hamstring stretch, then drive hips forward to stand.",
        ["Barbell Bench Press"]        = "Lie on bench, grip bar slightly wider than shoulder-width. Lower bar to lower chest with control, press back to full arm extension.",
        ["Barbell Incline Bench Press"]= "Set bench to 30-45 degrees. Grip bar wider than shoulder-width, lower to upper chest, press back up.",
        ["Barbell Overhead Press"]     = "Stand with bar at shoulder height in front rack. Press bar overhead to full lockout, keeping core braced and ribs down.",
        ["Barbell Bent-Over Row"]      = "Hinge forward 45 degrees, grip bar shoulder-width. Pull bar to lower ribcage by driving elbows back, then lower with control.",
        ["Barbell Hip Thrust"]         = "Upper back on bench, bar across hip crease. Drive hips up by contracting glutes until body is parallel to floor, then lower.",
        ["Dumbbell Bench Press"]       = "Lie on bench holding dumbbells. Lower them to chest level with elbows at 45 degrees, then press up until arms are extended.",
        ["Dumbbell Shoulder Press"]    = "Sit or stand with dumbbells at shoulder height. Press overhead to full extension, lower back to start.",
        ["Dumbbell Lateral Raise"]     = "Hold dumbbells at sides. Raise arms to shoulder height with slight elbow bend, pause at top, lower with control.",
        ["Dumbbell Bicep Curl"]        = "Hold dumbbells with supinated grip. Keep elbows tucked, curl weights to shoulder level, squeeze biceps, lower with control.",
        ["Dumbbell Row"]               = "Place one knee on bench for support. Hold dumbbell with other hand, pull elbow up and back until dumbbell reaches ribcage.",
        ["Kettlebell Swing"]           = "Hinge at hips with soft knees, grip kettlebell. Drive hips forward explosively to swing bell to chest height, then hinge back.",
        ["Kettlebell Turkish Get-Up"]  = "Start lying with kettlebell pressed overhead. Move through a series of positions—roll to elbow, post hand, knee, stand—keeping bell locked out.",
        ["Pull-Up"]                    = "Hang from bar with overhand grip, hands shoulder-width apart. Pull body up until chin clears bar, fully extend arms on descent.",
        ["Chin-Up"]                    = "Hang from bar with underhand grip, hands shoulder-width apart. Pull body up until chin clears bar, fully extend arms on descent.",
        ["Dip"]                        = "Support body on parallel bars with arms extended. Lower by bending elbows until shoulders are below elbows, then press back up.",
        ["Push-Up"]                    = "Start in high plank. Lower chest to floor by bending elbows at 45 degrees to torso, then press back to start, keeping body rigid.",
        ["Plank"]                      = "Forearms on floor, body in straight line from head to heels. Brace core, squeeze glutes, and hold position without sagging hips.",
        ["Thruster"]                   = "Hold barbell in front rack. Descend into squat, then explosively stand and use momentum to press bar overhead to full lockout.",
        ["Wall Ball"]                  = "Hold medicine ball at chest, feet shoulder-width. Squat to parallel, then explosively stand and throw ball to target on wall, catch and repeat.",
        ["Box Jump"]                   = "Stand facing box with feet hip-width. Bend knees, swing arms, jump onto box landing softly with bent knees. Step down and repeat.",
        ["Double Under"]               = "Jump rope with two rope rotations per jump. Stay on balls of feet, keep jumps low, use wrist rotation to spin rope.",
        ["Toes-to-Bar"]                = "Hang from pull-up bar with straight arms. Engage core and raise straight legs to touch the bar with toes, lower with control.",
        ["Muscle-Up"]                  = "Hang from bar, generate kip swing. As hips rise, aggressively pull and transition hands over bar to support position, then press up.",
        ["Handstand Push-Up"]          = "Kick into handstand against wall. Lower head toward floor by bending elbows, press back to full lockout maintaining tight midline.",
        ["Rope Climb"]                 = "Jump to grip rope with both hands. Pull and wrap feet using J-hook or S-hook technique, stand on rope to advance upward.",
        ["Farmer's Walk"]              = "Pick up heavy implements in each hand. Walk upright with shoulders back and core braced for prescribed distance.",
        ["Tire Flip"]                  = "Set stance close to tire, hands under rim. Drive tire up with legs, transition hands as it rises past waist, push to flip.",
        ["Clean and Jerk"]             = "Pull bar from floor to shoulders in one movement (clean), stand, then dip and drive overhead (jerk) to full lockout.",
        ["Power Clean"]                = "Pull bar from floor explosively, quickly drop under and catch in quarter-squat with bar on front deltoids, then stand.",
        ["Snatch"]                     = "Pull bar from floor with wide grip in one movement to overhead, catching in full squat. Stand to complete the lift.",
        ["Running"]                    = "Maintain upright posture, forward lean from ankles. Drive knees up, push off with each stride, breathe rhythmically.",
        ["Burpee"]                     = "From standing, squat and place hands on floor, jump feet back to plank, perform push-up, jump feet forward, then jump and clap overhead.",
        ["L-Sit"]                      = "Support body on parallel bars or floor. Extend legs horizontally parallel to ground, hold position by bracing abs and depressing scapulae.",
        ["Handstand Hold"]             = "Kick to handstand with tight hollow body. Stack hips over shoulders, arms over wrists. Point toes and hold balance.",
        ["Planche"]                    = "Support body on hands with body horizontal. Protract scapulae and lean shoulders forward over hands, keeping straight body parallel to floor.",
        ["Front Lever"]                = "Hang from bar, pull shoulders down. Raise body to horizontal position with arms straight, body parallel to floor, hold.",
        ["Hip Flexor Stretch"]         = "Kneel on one knee, other foot forward. Push hips forward keeping upright torso until stretch is felt in front of rear hip. Hold.",
        ["Pigeon Pose"]                = "From downward dog, bring one shin forward parallel to wrists. Lower hips toward floor, keep back leg extended, fold torso forward. Hold.",
    };

    public void GenerateDescription(Exercise exercise)
    {
        // Strip any existing HTML tags first
        if (!string.IsNullOrWhiteSpace(exercise.ShortDescription))
        {
            exercise.ShortDescription = StripHtml(exercise.ShortDescription);
            if (exercise.ShortDescription.Length > MaxLength)
                exercise.ShortDescription = exercise.ShortDescription[..MaxLength];
            if (!string.IsNullOrWhiteSpace(exercise.ShortDescription))
                return;
        }

        if (KnownDescriptions.TryGetValue(exercise.Name, out var known))
        {
            exercise.ShortDescription = known.Length > MaxLength ? known[..MaxLength] : known;
            return;
        }

        exercise.ShortDescription = GenerateHeuristic(exercise);
    }

    private static string GenerateHeuristic(Exercise exercise)
    {
        var name = exercise.Name;
        var muscle = exercise.PrimaryMuscle;
        var secondary = exercise.SecondaryMuscles.Count > 0
            ? $" and {exercise.SecondaryMuscles[0]}"
            : string.Empty;

        string desc = exercise.ActivityType switch
        {
            "distance" => $"Perform {name} at a steady pace, focusing on breathing and form. Targets {muscle}{secondary}.",
            "duration" => $"Hold {name} position with proper form. Brace the {muscle}{secondary} throughout the duration.",
            "bodyweight" => $"Perform {name} using body weight resistance. Targets the {muscle}{secondary}. Focus on controlled movement.",
            "machine"  => $"Use the machine to perform {name}. Adjust seat and weight, target the {muscle}{secondary} through full range of motion.",
            _          => $"Perform {name} with appropriate weight. Focus on targeting the {muscle}{secondary} through full range of motion with controlled tempo.",
        };

        return desc.Length > MaxLength ? desc[..MaxLength] : desc;
    }

    private static string StripHtml(string input) =>
        HtmlTagRegex().Replace(input, string.Empty)
            .Replace("&nbsp;", " ")
            .Replace("&amp;", "&")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Trim();

    [GeneratedRegex("<[^>]+>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
