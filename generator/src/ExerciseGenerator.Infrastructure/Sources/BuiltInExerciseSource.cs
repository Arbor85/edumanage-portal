using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Built-in, high-quality exercise dataset covering all fitness disciplines.
/// Always available — used as a guaranteed baseline alongside API sources.
/// </summary>
public class BuiltInExerciseSource : IExerciseSource
{
    public string SourceName => "Built-In Library";

    public Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
        => Task.FromResult<IEnumerable<Exercise>>(CreateExercises());

    private static IReadOnlyList<Exercise> CreateExercises()
    {
        var raw = GetRawData();
        return raw.Select(r => new Exercise
        {
            Name = r.Name,
            ShortDescription = r.Description,
            PrimaryMuscle = r.PrimaryMuscle,
            SecondaryMuscles = [.. r.SecondaryMuscles],
            Muscles = BuildMuscleList(r.PrimaryMuscle, r.SecondaryMuscles),
            Tags = [.. r.Tags],
            ActivityType = r.ActivityType,
            ActivityTrackType = r.ActivityTrackType,
        }).ToList();
    }

    private static List<Muscle> BuildMuscleList(string primary, string[] secondary)
    {
        var list = new List<Muscle> { new() { Name = primary } };
        list.AddRange(secondary.Select(m => new Muscle { Name = m }));
        return list;
    }

    private static IEnumerable<RawExercise> GetRawData() =>
    [
        // ── BARBELL ──────────────────────────────────────────────────────────
        new("Barbell Back Squat",
            "Stand feet shoulder-width apart, bar on upper traps. Push hips back and bend knees until thighs are parallel, then drive through heels to stand.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings", "Core"],
            ["barbell", "compound", "powerlifting", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Front Squat",
            "Hold bar in front rack on deltoids, elbows high. Descend with upright torso until thighs are parallel, then drive through heels to stand.",
            "Quadriceps", ["Gluteus Maximus", "Core", "Upper Back"],
            ["barbell", "compound", "weightlifting", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Deadlift",
            "Bar over mid-foot, grip just outside legs, brace core. Push the floor away, bar stays close, extend hips and knees simultaneously to lockout.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae", "Trapezius"],
            ["barbell", "compound", "powerlifting", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Sumo Deadlift",
            "Wide stance with toes flared, grip bar between legs. Keep chest up, drive hips forward as you stand, maintain vertical shin angle.",
            "Hamstrings", ["Gluteus Maximus", "Adductors", "Erector Spinae"],
            ["barbell", "compound", "powerlifting", "intermediate"],
            "weighted", "repetitions"),

        new("Romanian Deadlift",
            "Hold bar at hips with soft knee bend. Hinge at hips, push them back, lower bar along thighs until hamstring stretch, drive hips forward to stand.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Bench Press",
            "Lie on bench, grip bar slightly wider than shoulder-width. Lower bar to lower chest with 45-degree elbow path, press back to full arm extension.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps"],
            ["barbell", "compound", "powerlifting", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Incline Bench Press",
            "Set bench to 30-45 degrees, grip bar wider than shoulder-width. Lower to upper chest with control, press back to lockout.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Overhead Press",
            "Bar at shoulder height in front rack. Press bar overhead to full lockout, keeping core braced, ribs down, and glutes squeezed.",
            "Anterior Deltoid", ["Medial Deltoid", "Triceps", "Trapezius"],
            ["barbell", "compound", "powerlifting", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Bent-Over Row",
            "Hinge forward 45 degrees with bar hanging at mid-shin. Pull bar to lower ribcage by driving elbows back, squeeze shoulder blades, lower with control.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps", "Rear Deltoid"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Hip Thrust",
            "Upper back rests on bench, bar pad across hip crease. Drive hips up by squeezing glutes until body is parallel to floor, lower slowly.",
            "Gluteus Maximus", ["Hamstrings", "Core"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Lunge",
            "Hold bar on traps, step forward until rear knee nearly touches floor. Push through front heel to return to start and alternate legs.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Good Morning",
            "Bar on traps, feet shoulder-width. With soft knee bend, hinge at hips pushing them back until torso is parallel to floor, squeeze glutes to stand.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae"],
            ["barbell", "compound", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Bicep Curl",
            "Hold bar with supinated grip, elbows tucked at sides. Curl bar to shoulders by flexing biceps, squeeze at top, lower with control.",
            "Biceps", ["Forearms", "Brachialis"],
            ["barbell", "isolation", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Tricep Skull Crusher",
            "Lie on bench, press bar to arm extension. Hinge at elbows, lower bar toward forehead, keep upper arms vertical, press back to start.",
            "Triceps", [],
            ["barbell", "isolation", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Upright Row",
            "Hold bar with narrow grip in front of thighs. Pull elbows up and out to shoulder height, keeping bar close to body, lower with control.",
            "Trapezius", ["Medial Deltoid", "Biceps"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Shrug",
            "Hold bar at hip level with straight arms. Shrug shoulders straight up toward ears, hold briefly, lower slowly. Do not roll shoulders.",
            "Trapezius", ["Forearms"],
            ["barbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Barbell Calf Raise",
            "Bar on traps, stand with balls of feet on raised surface. Lower heels below platform level, then rise up onto toes, squeezing calves at top.",
            "Gastrocnemius", ["Soleus"],
            ["barbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Barbell Hack Squat",
            "Bar behind legs, grip just outside hips. Squat down with chest up and back straight until thighs are parallel, then drive back up.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Push Press",
            "Bar in front rack, dip slightly with knees. Explosively drive bar overhead using leg drive, lock out arms overhead, lower under control.",
            "Anterior Deltoid", ["Quadriceps", "Triceps", "Medial Deltoid"],
            ["barbell", "compound", "weightlifting", "crossfit", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Pendlay Row",
            "Bar on floor, hinge to horizontal torso. Pull bar explosively to lower chest, lower bar completely to floor between each rep.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Floor Press",
            "Lie on floor, press bar overhead to extension. Lower until upper arms touch floor, press back to start. Eliminates leg drive and leg press arch.",
            "Pectoralis Major", ["Triceps", "Anterior Deltoid"],
            ["barbell", "compound", "powerlifting", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Zercher Squat",
            "Hold bar in crook of elbows at waist height. Squat with upright torso until elbows touch thighs, stand back up driving through heels.",
            "Quadriceps", ["Gluteus Maximus", "Core", "Upper Back"],
            ["barbell", "compound", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Drag Curl",
            "Hold bar at hips with supinated grip. Drag bar up the body by pulling elbows back, keeping bar touching torso throughout movement.",
            "Biceps", ["Rear Deltoid"],
            ["barbell", "isolation", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Bulgarian Split Squat",
            "Rear foot elevated on bench, bar on traps. Lower rear knee toward floor keeping torso upright, drive through front heel to stand.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["barbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Barbell Hip Extension",
            "Bar on upper back, stand at hip-width. Hinge at hips with soft knees until torso is parallel to floor, squeeze glutes to return to standing.",
            "Gluteus Maximus", ["Hamstrings", "Erector Spinae"],
            ["barbell", "compound", "intermediate"],
            "weighted", "repetitions"),

        // ── DUMBBELL ─────────────────────────────────────────────────────────
        new("Dumbbell Bench Press",
            "Lie on bench with dumbbells at chest level. Press up to full extension, lower with elbows at 45 degrees. Greater range of motion than barbell.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Incline Bench Press",
            "Set bench to 30-45 degrees, hold dumbbells at upper chest. Press to extension, lower slowly with elbows at 45 degrees to torso.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Shoulder Press",
            "Sit or stand with dumbbells at shoulder height. Press overhead to full extension, lower back to shoulder height with control.",
            "Anterior Deltoid", ["Medial Deltoid", "Triceps"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Lateral Raise",
            "Hold dumbbells at sides with slight elbow bend. Raise arms out to shoulder height in arc motion, pause briefly, lower with control.",
            "Medial Deltoid", ["Anterior Deltoid", "Trapezius"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Front Raise",
            "Hold dumbbells in front of thighs. Raise one or both arms forward to shoulder height with slight elbow bend, lower with control.",
            "Anterior Deltoid", ["Medial Deltoid"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Bicep Curl",
            "Hold dumbbells with supinated grip, elbows tucked at sides. Curl weights to shoulder height squeezing biceps at top, lower slowly.",
            "Biceps", ["Forearms", "Brachialis"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Hammer Curl",
            "Hold dumbbells in neutral grip. Curl both or alternating toward shoulder, keeping neutral grip throughout movement, lower with control.",
            "Biceps", ["Brachialis", "Forearms"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Tricep Kickback",
            "Hinge forward with elbow at 90 degrees. Extend forearm back by contracting tricep, straighten fully, pause and return to start.",
            "Triceps", [],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Romanian Deadlift",
            "Hold dumbbells at hips, soft knee bend. Hinge at hips, lower weights along thighs to mid-shin, drive hips forward to return.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Lunge",
            "Hold dumbbells at sides. Step forward until rear knee nearly touches floor, push back through front heel to starting position.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Bulgarian Split Squat",
            "Rear foot on bench, hold dumbbells at sides. Lower until rear knee nearly touches floor, drive through front heel to stand.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["dumbbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Dumbbell Row",
            "One knee on bench, hold dumbbell in opposite hand. Pull dumbbell to hip by driving elbow back and up, lower with control.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps", "Rear Deltoid"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Chest Fly",
            "Lie on bench, arms extended over chest. Lower dumbbells in wide arc to chest level, feeling a stretch, then return to starting arc.",
            "Pectoralis Major", ["Anterior Deltoid"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Arnold Press",
            "Hold dumbbells at shoulder height with palms facing you. As you press overhead, rotate palms outward, lower reversing rotation.",
            "Anterior Deltoid", ["Medial Deltoid", "Triceps"],
            ["dumbbell", "compound", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Dumbbell Reverse Fly",
            "Hinge forward holding dumbbells below chest. Raise arms out to sides with soft elbow bend, squeeze rear deltoids, lower with control.",
            "Posterior Deltoid", ["Rhomboids", "Trapezius"],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Goblet Squat",
            "Hold dumbbell vertically at chest with both hands. Squat with elbows inside knees until thighs are parallel to floor, stand back up.",
            "Quadriceps", ["Gluteus Maximus", "Core"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Concentration Curl",
            "Seated, rest elbow on inner thigh. Curl dumbbell to shoulder isolating the bicep, squeeze at top, lower fully.",
            "Biceps", [],
            ["dumbbell", "isolation", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Hip Thrust",
            "Upper back on bench, dumbbell on lap. Drive hips up by squeezing glutes until body is parallel to floor, lower slowly.",
            "Gluteus Maximus", ["Hamstrings"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Dumbbell Step-Up",
            "Hold dumbbells at sides, place one foot on box. Drive through heel to step up, bring rear foot up, step back down and alternate.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["dumbbell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        // ── KETTLEBELL ───────────────────────────────────────────────────────
        new("Kettlebell Swing",
            "Hinge at hips, grip bell between legs. Drive hips forward explosively to swing bell to chest height, hinge back and repeat.",
            "Hamstrings", ["Gluteus Maximus", "Core", "Cardiovascular"],
            ["kettlebell", "compound", "crossfit", "bodybuilding", "intermediate"],
            "weighted", "repetitions"),

        new("Kettlebell Turkish Get-Up",
            "Start lying with bell pressed overhead. Move through elbow, hand, knee to standing while keeping bell locked out overhead. Reverse to return.",
            "Core", ["Shoulder Girdle", "Gluteus Maximus", "Quadriceps"],
            ["kettlebell", "compound", "crossfit", "advanced"],
            "weighted", "repetitions"),

        new("Kettlebell Goblet Squat",
            "Hold bell at chest by horns. Squat with elbows inside knees, keeping torso upright until thighs are parallel to floor, stand back up.",
            "Quadriceps", ["Gluteus Maximus", "Core"],
            ["kettlebell", "compound", "bodybuilding", "beginner"],
            "weighted", "repetitions"),

        new("Kettlebell Snatch",
            "One-arm swing from between legs. As bell rises, punch hand through the handle overhead to lockout in one fluid movement.",
            "Posterior Chain", ["Core", "Anterior Deltoid"],
            ["kettlebell", "compound", "crossfit", "weightlifting", "advanced"],
            "weighted", "repetitions"),

        new("Kettlebell Clean and Press",
            "Clean bell to rack position on shoulder, then press overhead to full lockout. Return to rack and lower to swing position.",
            "Anterior Deltoid", ["Hamstrings", "Core", "Triceps"],
            ["kettlebell", "compound", "crossfit", "intermediate"],
            "weighted", "repetitions"),

        new("Kettlebell Windmill",
            "Press bell overhead, feet at 45 degrees. Push hip to side, slide free hand down rear leg until you can touch floor, return.",
            "Core", ["Obliques", "Hamstrings", "Shoulder Girdle"],
            ["kettlebell", "compound", "mobility", "intermediate"],
            "weighted", "repetitions"),

        new("Kettlebell Deadlift",
            "Bell between feet, hinge and grip the handle. Push floor away to stand with hips and knees extended, keeping back neutral.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae"],
            ["kettlebell", "compound", "beginner"],
            "weighted", "repetitions"),

        new("Kettlebell Farmers Walk",
            "Pick up heavy kettlebell(s) in each hand. Walk upright with shoulders back, core braced for prescribed distance or time.",
            "Forearms", ["Trapezius", "Core", "Cardiovascular"],
            ["kettlebell", "strongman", "compound", "intermediate"],
            "weighted", "duration"),

        new("Kettlebell Press",
            "Clean bell to rack position. Press overhead by extending arm to full lockout, lower back to rack position with control.",
            "Anterior Deltoid", ["Medial Deltoid", "Triceps", "Core"],
            ["kettlebell", "compound", "intermediate"],
            "weighted", "repetitions"),

        new("Kettlebell Row",
            "Hinge forward, bell on floor. Pull bell to hip by driving elbow back, keeping torso parallel to floor, lower to floor and repeat.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps"],
            ["kettlebell", "compound", "beginner"],
            "weighted", "repetitions"),

        // ── BODYWEIGHT ───────────────────────────────────────────────────────
        new("Pull-Up",
            "Hang from bar with overhand grip, hands shoulder-width apart. Pull body up until chin clears bar, fully extend arms on descent.",
            "Latissimus Dorsi", ["Biceps", "Rhomboids", "Core"],
            ["bodyweight", "compound", "crossfit", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Chin-Up",
            "Hang from bar with underhand grip, hands shoulder-width apart. Pull body up until chin clears bar, fully extend arms on descent.",
            "Latissimus Dorsi", ["Biceps", "Core"],
            ["bodyweight", "compound", "beginner"],
            "bodyweight", "repetitions"),

        new("Dip",
            "Support body on parallel bars with arms extended. Lower by bending elbows until shoulders drop below elbows, then press back to start.",
            "Triceps", ["Pectoralis Major", "Anterior Deltoid"],
            ["bodyweight", "compound", "crossfit", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Push-Up",
            "High plank with hands slightly wider than shoulders. Lower chest to floor with elbows at 45 degrees to torso, press back to start, keeping body rigid.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps", "Core"],
            ["bodyweight", "compound", "beginner"],
            "bodyweight", "repetitions"),

        new("Diamond Push-Up",
            "Hands in diamond shape under sternum, arms close to body. Lower chest toward hands, keeping elbows tight to ribs, press back to start.",
            "Triceps", ["Pectoralis Major", "Anterior Deltoid"],
            ["bodyweight", "compound", "intermediate"],
            "bodyweight", "repetitions"),

        new("Pike Push-Up",
            "High plank, walk feet toward hands into inverted V position. Lower head between hands by bending elbows, press back to start.",
            "Anterior Deltoid", ["Triceps", "Trapezius"],
            ["bodyweight", "compound", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Air Squat",
            "Stand feet shoulder-width apart. Sit hips back and down past parallel, knees tracking over toes. Drive through heels to stand.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["bodyweight", "compound", "crossfit", "beginner"],
            "bodyweight", "repetitions"),

        new("Pistol Squat",
            "Stand on one leg, other leg extended forward. Sit back and down on single leg until hip crease passes knee, drive to stand. Requires balance.",
            "Quadriceps", ["Gluteus Maximus", "Core"],
            ["bodyweight", "compound", "gymnastics", "crossfit", "advanced"],
            "bodyweight", "repetitions"),

        new("Burpee",
            "From standing, squat, place hands on floor, jump feet back to plank, lower chest to floor, push up, jump feet forward, jump up clapping overhead.",
            "Full Body", ["Cardiovascular", "Core"],
            ["bodyweight", "compound", "crossfit", "cardio", "jumping", "beginner"],
            "bodyweight", "repetitions"),

        new("Mountain Climber",
            "Start in high plank. Drive one knee toward chest, then quickly alternate legs in running motion, keeping hips level.",
            "Core", ["Shoulders", "Cardiovascular"],
            ["bodyweight", "compound", "crossfit", "cardio", "beginner"],
            "bodyweight", "repetitions"),

        new("Sit-Up",
            "Lie on back, knees bent, hands behind head or across chest. Engage core to lift torso to upright position, lower slowly back to floor.",
            "Rectus Abdominis", ["Hip Flexors", "Obliques"],
            ["bodyweight", "compound", "crossfit", "beginner"],
            "bodyweight", "repetitions"),

        new("Crunch",
            "Lie on back, knees bent. Place hands behind head, curl shoulders off floor by contracting abs, lower slowly. Do not pull on neck.",
            "Rectus Abdominis", ["Obliques"],
            ["bodyweight", "isolation", "beginner"],
            "bodyweight", "repetitions"),

        new("Leg Raise",
            "Lie flat on back with legs straight. Raise legs to 90 degrees using abs, lower slowly without letting feet touch the floor.",
            "Rectus Abdominis", ["Hip Flexors", "Core"],
            ["bodyweight", "isolation", "intermediate"],
            "bodyweight", "repetitions"),

        new("Plank",
            "Forearms on floor, body in straight line from head to heels. Brace core, squeeze glutes, breathe normally. Do not let hips sag.",
            "Core", ["Shoulder Girdle", "Gluteus Maximus"],
            ["bodyweight", "compound", "crossfit", "beginner"],
            "bodyweight", "duration"),

        new("Side Plank",
            "Lie on side, forearm on floor. Lift hips creating straight line from head to feet. Hold position bracing obliques and core.",
            "Obliques", ["Core", "Hip Abductors"],
            ["bodyweight", "compound", "beginner"],
            "bodyweight", "duration"),

        new("Inverted Row",
            "Grip bar or rings with overhand grip, body in straight line beneath. Pull chest to bar by bending elbows, lower fully extended.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps", "Core"],
            ["bodyweight", "compound", "beginner"],
            "bodyweight", "repetitions"),

        new("Superman",
            "Lie face down with arms extended overhead. Simultaneously lift arms, chest, and legs off floor, hold briefly, lower and repeat.",
            "Erector Spinae", ["Gluteus Maximus", "Rear Deltoid"],
            ["bodyweight", "isolation", "beginner"],
            "bodyweight", "repetitions"),

        new("Hip Extension",
            "On all fours. Keeping knee bent at 90 degrees, raise one leg up and back until hip is extended, squeeze glute, lower and repeat.",
            "Gluteus Maximus", ["Hamstrings", "Core"],
            ["bodyweight", "isolation", "beginner"],
            "bodyweight", "repetitions"),

        new("Jump Squat",
            "Perform air squat, then explosively jump at the top. Land softly with bent knees and immediately descend into next squat.",
            "Quadriceps", ["Gluteus Maximus", "Calves", "Cardiovascular"],
            ["bodyweight", "compound", "jumping", "cardio", "intermediate"],
            "bodyweight", "repetitions"),

        // ── CROSSFIT ─────────────────────────────────────────────────────────
        new("Thruster",
            "Bar in front rack. Descend into full squat, then explosively stand and use momentum to press bar overhead to full lockout in one motion.",
            "Quadriceps", ["Anterior Deltoid", "Gluteus Maximus", "Core"],
            ["barbell", "compound", "crossfit", "intermediate"],
            "weighted", "repetitions"),

        new("Wall Ball",
            "Hold medicine ball at chest, squat to parallel depth. Explosively stand and throw ball to 10-foot target on wall, catch and immediately descend.",
            "Quadriceps", ["Anterior Deltoid", "Core", "Gluteus Maximus"],
            ["compound", "crossfit", "cardio", "intermediate"],
            "weighted", "repetitions"),

        new("Box Jump",
            "Stand facing box, feet hip-width apart. Bend knees, swing arms and jump onto box landing softly with bent knees. Step down and repeat.",
            "Quadriceps", ["Gluteus Maximus", "Calves", "Cardiovascular"],
            ["bodyweight", "compound", "jumping", "crossfit", "intermediate"],
            "bodyweight", "repetitions"),

        new("Double Under",
            "Jump rope with two rope rotations per single jump. Maintain relaxed rhythm, stay on balls of feet, use quick wrist rotation.",
            "Calves", ["Cardiovascular", "Shoulders"],
            ["bodyweight", "jumping", "crossfit", "cardio", "intermediate"],
            "bodyweight", "repetitions"),

        new("Kipping Pull-Up",
            "Hang from bar, create hollow/arch swing. At the top of the swing, aggressively pull and press down on bar to cycle through reps.",
            "Latissimus Dorsi", ["Biceps", "Core", "Shoulders"],
            ["bodyweight", "compound", "crossfit", "intermediate"],
            "bodyweight", "repetitions"),

        new("Toes-to-Bar",
            "Hang from bar with straight arms. Engage core and lift straight legs up to touch the bar with toes. Lower with control and repeat.",
            "Rectus Abdominis", ["Hip Flexors", "Core", "Shoulder Girdle"],
            ["bodyweight", "compound", "crossfit", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Knees-to-Elbows",
            "Hang from bar. Bring knees up to touch elbows by flexing core and hips. Lower with control. Easier progression before Toes-to-Bar.",
            "Rectus Abdominis", ["Hip Flexors", "Core"],
            ["bodyweight", "compound", "crossfit", "beginner"],
            "bodyweight", "repetitions"),

        new("Muscle-Up",
            "From hang on bar or rings, generate kip. Pull explosively and transition hands over bar to support position, then push to lockout.",
            "Triceps", ["Latissimus Dorsi", "Core", "Anterior Deltoid"],
            ["bodyweight", "compound", "gymnastics", "crossfit", "advanced"],
            "bodyweight", "repetitions"),

        new("Ring Muscle-Up",
            "From hang on rings, generate swing. Pull explosively through transition to support, lean forward and lock out rings turned out.",
            "Triceps", ["Latissimus Dorsi", "Core", "Pectoralis Major"],
            ["bodyweight", "rings", "compound", "gymnastics", "crossfit", "advanced"],
            "bodyweight", "repetitions"),

        new("Rope Climb",
            "Jump to grip rope with both hands overhead. Pull yourself up using arms and legs alternately using J-hook or S-hook foot technique.",
            "Biceps", ["Latissimus Dorsi", "Core", "Forearms"],
            ["rope", "bodyweight", "compound", "crossfit", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Handstand Push-Up",
            "Kick into handstand against wall. Lower head to floor by bending elbows, press back to full arm lockout maintaining tight midline.",
            "Anterior Deltoid", ["Trapezius", "Triceps", "Core"],
            ["bodyweight", "compound", "gymnastics", "crossfit", "advanced"],
            "bodyweight", "repetitions"),

        new("Farmer's Carry",
            "Grip heavy implements in both hands. Walk upright with shoulders back, core braced and neck neutral for prescribed distance or time.",
            "Forearms", ["Trapezius", "Core", "Quadriceps"],
            ["compound", "strongman", "crossfit", "intermediate"],
            "weighted", "duration"),

        new("Sled Push",
            "Place hands on sled uprights, lean forward at 45 degrees. Drive legs powerfully to push sled forward, maintaining low position.",
            "Quadriceps", ["Gluteus Maximus", "Cardiovascular", "Core"],
            ["sled", "compound", "strongman", "crossfit", "intermediate"],
            "weighted", "duration"),

        new("Assault Bike",
            "Sit on assault bike, grip handles. Push and pull handles while pedaling to generate caloric output. Maintain target RPM throughout.",
            "Cardiovascular", ["Quadriceps", "Shoulders", "Core"],
            ["cardio", "crossfit", "beginner"],
            "calories", "calories"),

        new("Battle Ropes",
            "Hold rope ends, stand in athletic stance. Create wave patterns using alternating or simultaneous arm movement for prescribed time.",
            "Shoulders", ["Core", "Cardiovascular", "Biceps"],
            ["cardio", "crossfit", "compound", "intermediate"],
            "weighted", "duration"),

        // ── OLYMPIC LIFTING ──────────────────────────────────────────────────
        new("Clean and Jerk",
            "Pull bar from floor to shoulders in clean (power or full squat). Stand, dip and drive bar overhead in jerk, split or power style. Lock out.",
            "Quadriceps", ["Posterior Chain", "Anterior Deltoid", "Core"],
            ["barbell", "compound", "weightlifting", "crossfit", "olympic-lift", "advanced"],
            "weighted", "repetitions"),

        new("Power Clean",
            "Pull bar from floor explosively, jump and shrug. Drop under the bar in a quarter-squat catching it on front deltoids, stand to complete.",
            "Quadriceps", ["Hamstrings", "Trapezius", "Core"],
            ["barbell", "compound", "weightlifting", "crossfit", "olympic-lift", "intermediate"],
            "weighted", "repetitions"),

        new("Hang Clean",
            "Start with bar at hip or knee height. Hinge back then drive hips, pull bar to shoulders in quarter or full squat, stand.",
            "Quadriceps", ["Hamstrings", "Trapezius"],
            ["barbell", "compound", "weightlifting", "crossfit", "olympic-lift", "intermediate"],
            "weighted", "repetitions"),

        new("Hang Power Clean",
            "Bar hangs at mid-thigh. Aggressive hip extension to pull bar, catch in quarter-squat on front deltoids, stand to complete.",
            "Quadriceps", ["Hamstrings", "Trapezius", "Core"],
            ["barbell", "compound", "weightlifting", "crossfit", "olympic-lift", "intermediate"],
            "weighted", "repetitions"),

        new("Snatch",
            "Wide grip, bar from floor. Pull bar from floor to overhead in one motion, catching in full overhead squat. Stand to complete.",
            "Posterior Chain", ["Quadriceps", "Trapezius", "Core", "Shoulders"],
            ["barbell", "compound", "weightlifting", "olympic-lift", "advanced"],
            "weighted", "repetitions"),

        new("Power Snatch",
            "Wide grip, bar from floor. Pull aggressively and receive bar overhead in quarter-squat. Greater power required than full snatch.",
            "Posterior Chain", ["Quadriceps", "Trapezius", "Shoulders"],
            ["barbell", "compound", "weightlifting", "crossfit", "olympic-lift", "advanced"],
            "weighted", "repetitions"),

        new("Hang Snatch",
            "Wide grip, bar at hip height. Hinge and drive hips to pull bar overhead, catch in full squat or power position, stand.",
            "Posterior Chain", ["Trapezius", "Core", "Shoulders"],
            ["barbell", "compound", "weightlifting", "olympic-lift", "advanced"],
            "weighted", "repetitions"),

        new("Clean Pull",
            "Pull bar from floor using clean technique to full hip extension, shrug and rise on toes. Bar does not pass hips height. Builds clean pull.",
            "Hamstrings", ["Gluteus Maximus", "Trapezius", "Calves"],
            ["barbell", "compound", "weightlifting", "olympic-lift", "intermediate"],
            "weighted", "repetitions"),

        new("Snatch Pull",
            "Wide grip, pull from floor using snatch mechanics to full extension and shrug. Do not receive bar. Builds pulling power for snatch.",
            "Hamstrings", ["Gluteus Maximus", "Trapezius", "Calves"],
            ["barbell", "compound", "weightlifting", "olympic-lift", "intermediate"],
            "weighted", "repetitions"),

        new("Jerk",
            "Bar on front rack at shoulder height. Dip with knees and drive bar overhead, split or power style, catch at full lockout, recover.",
            "Anterior Deltoid", ["Quadriceps", "Triceps", "Core"],
            ["barbell", "compound", "weightlifting", "olympic-lift", "advanced"],
            "weighted", "repetitions"),

        // ── GYMNASTICS ───────────────────────────────────────────────────────
        new("L-Sit",
            "Support body on parallel bars or floor. Keep legs extended horizontally parallel to ground, hips below shoulders. Hold by bracing abs.",
            "Rectus Abdominis", ["Hip Flexors", "Triceps", "Core"],
            ["bodyweight", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        new("Handstand Hold",
            "Kick to handstand with tight hollow body. Stack hips over shoulders, arms over wrists, toes pointed. Use fingertip pressure to balance.",
            "Anterior Deltoid", ["Core", "Trapezius", "Wrist Flexors"],
            ["bodyweight", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        new("Handstand Walk",
            "Kick to handstand, then shift weight between hands to move forward. Keep tight hollow body, eyes slightly forward. Control with finger pressure.",
            "Anterior Deltoid", ["Core", "Shoulder Girdle", "Triceps"],
            ["bodyweight", "gymnastics", "crossfit", "advanced"],
            "bodyweight", "duration"),

        new("Planche",
            "Support body on hands with body held horizontal, parallel to floor. Protract scapulae and lean shoulders far forward over hands.",
            "Pectoralis Major", ["Anterior Deltoid", "Core", "Triceps"],
            ["bodyweight", "rings", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        new("Front Lever",
            "Hang from bar or rings, pull shoulders down. Raise body to horizontal position, arms straight, body parallel to floor. Hold.",
            "Latissimus Dorsi", ["Core", "Biceps", "Rear Deltoid"],
            ["bodyweight", "rings", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        new("Back Lever",
            "Hang from bar or rings, rotate backward until body is horizontal below rings or bar, arms straight. Engage rear chain to hold.",
            "Pectoralis Minor", ["Biceps", "Core", "Rear Deltoid"],
            ["bodyweight", "rings", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        new("Ring Dip",
            "Support on rings with arms extended. Lower by bending elbows, rings turn out at bottom. Press back up, turn rings in at top.",
            "Triceps", ["Pectoralis Major", "Anterior Deltoid", "Core"],
            ["bodyweight", "rings", "compound", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Ring Push-Up",
            "Grip rings close to floor in push-up position. Lower chest between rings, press back up while rings naturally turn out at lockout.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps", "Core"],
            ["bodyweight", "rings", "compound", "gymnastics", "intermediate"],
            "bodyweight", "repetitions"),

        new("Skin the Cat",
            "Hang from bar or rings, pull legs through arms. Continue rotation until in German hang, then reverse the movement back to start.",
            "Latissimus Dorsi", ["Biceps", "Core", "Shoulder Girdle"],
            ["bodyweight", "rings", "gymnastics", "mobility", "intermediate"],
            "bodyweight", "repetitions"),

        new("Human Flag",
            "Grip vertical pole with one hand above one below. Press down on lower hand, pull down on upper, hold body horizontal. Extreme oblique strength.",
            "Latissimus Dorsi", ["Core", "Obliques", "Shoulder Girdle"],
            ["bodyweight", "gymnastics", "advanced"],
            "bodyweight", "duration"),

        // ── STRONGMAN ────────────────────────────────────────────────────────
        new("Farmer's Walk",
            "Pick up implements in each hand at sides. Walk upright maintaining neutral spine and shoulders retracted. High weight and distance challenge grip.",
            "Forearms", ["Trapezius", "Core", "Quadriceps"],
            ["strongman", "compound", "intermediate"],
            "weighted", "duration"),

        new("Atlas Stone Lift",
            "Stand over stone, reach around and grip with both hands. Lap the stone onto thighs, then hug and extend hips to load onto platform.",
            "Core", ["Erector Spinae", "Gluteus Maximus", "Biceps"],
            ["strongman", "compound", "advanced"],
            "weighted", "repetitions"),

        new("Tire Flip",
            "Squat down and grip tire rim from outside. Drive with legs as tire tips up, transition hands to push as tire passes vertical, flip over.",
            "Hamstrings", ["Gluteus Maximus", "Core", "Pectoralis Major"],
            ["strongman", "compound", "advanced"],
            "weighted", "repetitions"),

        new("Log Press",
            "Clean log to chest in parallel grip, brace core. Press overhead to full lockout, neutral grip throughout movement.",
            "Anterior Deltoid", ["Triceps", "Medial Deltoid", "Core"],
            ["strongman", "compound", "intermediate"],
            "weighted", "repetitions"),

        new("Yoke Walk",
            "Step under yoke bar, position across traps, pick up. Walk briskly with short rapid steps, keeping torso stable and upright.",
            "Trapezius", ["Quadriceps", "Core", "Erector Spinae"],
            ["strongman", "compound", "intermediate"],
            "weighted", "duration"),

        new("Sandbag Carry",
            "Bear hug sandbag against chest and shoulder. Carry for distance keeping core braced and back neutral. Challenges grip and core stability.",
            "Core", ["Trapezius", "Erector Spinae", "Biceps"],
            ["strongman", "compound", "intermediate"],
            "weighted", "duration"),

        new("Car Deadlift",
            "Grip handles of car deadlift frame, similar to conventional deadlift. Drive through floor to hip lockout with neutral back throughout.",
            "Hamstrings", ["Gluteus Maximus", "Erector Spinae", "Trapezius"],
            ["strongman", "compound", "advanced"],
            "weighted", "repetitions"),

        new("Axle Press",
            "Clean or continental clean thick axle bar to chest. Press overhead to full lockout. Thick grip challenges forearms and wrist stability.",
            "Anterior Deltoid", ["Triceps", "Forearms", "Core"],
            ["strongman", "compound", "intermediate"],
            "weighted", "repetitions"),

        new("Keg Toss",
            "Hold keg at waist height, swing back then forward. Release keg upward, tossing over high bar. Requires coordination and explosive power.",
            "Posterior Chain", ["Shoulders", "Core", "Cardiovascular"],
            ["strongman", "compound", "advanced"],
            "weighted", "repetitions"),

        new("Circus Dumbbell Press",
            "Clean giant dumbbell to shoulder. Press overhead with one arm to full lockout. Offset load challenges stability and core bracing.",
            "Anterior Deltoid", ["Core", "Triceps", "Lateral Trunk"],
            ["strongman", "compound", "advanced"],
            "weighted", "repetitions"),

        // ── CARDIO / DISTANCE ────────────────────────────────────────────────
        new("Running",
            "Maintain upright posture with slight forward lean from ankles. Drive knees up, push off powerfully with each stride, breathe rhythmically.",
            "Cardiovascular", ["Quadriceps", "Hamstrings", "Calves"],
            ["running", "cardio", "beginner"],
            "distance", "distance"),

        new("Sprint",
            "Explosive running at maximum effort. Drive knees high, pump arms powerfully, lean slightly forward. Typically 10-400 meters.",
            "Cardiovascular", ["Quadriceps", "Hamstrings", "Calves"],
            ["running", "cardio", "crossfit", "intermediate"],
            "distance", "distance"),

        new("Cycling",
            "Maintain consistent pedal cadence with flat back and engaged core. Push through full pedal stroke, adjust resistance to target heart rate.",
            "Cardiovascular", ["Quadriceps", "Hamstrings", "Calves"],
            ["cardio", "beginner"],
            "distance", "distance"),

        new("Rowing Machine",
            "Drive with legs first, lean back slightly, then pull handle to lower ribcage. Return in reverse: arms, lean forward, then legs.",
            "Latissimus Dorsi", ["Core", "Quadriceps", "Biceps", "Cardiovascular"],
            ["rowing", "cardio", "crossfit", "compound", "beginner"],
            "distance", "distance"),

        new("Jump Rope",
            "Hold handles at hips, jump on balls of feet as rope passes beneath. Keep jumps low and consistent. Progress to double unders.",
            "Cardiovascular", ["Calves", "Shoulders"],
            ["bodyweight", "jumping", "cardio", "crossfit", "beginner"],
            "bodyweight", "repetitions"),

        new("Swimming",
            "Maintain streamlined body position, use kick and pull to propel through water. Rotate body with each stroke for power and efficiency.",
            "Cardiovascular", ["Pectoralis Major", "Latissimus Dorsi", "Full Body"],
            ["cardio", "beginner"],
            "distance", "distance"),

        new("Walking",
            "Maintain upright posture with natural arm swing. Heel-to-toe foot strike, land under center of mass, breathe naturally.",
            "Cardiovascular", ["Quadriceps", "Hamstrings", "Calves"],
            ["cardio", "beginner"],
            "distance", "distance"),

        new("Stair Climb",
            "Climb stairs or stair machine at steady pace. Drive through heel and glute of lead leg, maintain upright posture and rhythmic breathing.",
            "Quadriceps", ["Gluteus Maximus", "Cardiovascular", "Calves"],
            ["cardio", "bodyweight", "beginner"],
            "bodyweight", "duration"),

        new("Elliptical",
            "Maintain upright posture on elliptical machine. Push and pull handles while pedaling in elliptical motion. Keep core engaged.",
            "Cardiovascular", ["Quadriceps", "Hamstrings", "Shoulders"],
            ["machine", "cardio", "beginner"],
            "distance", "distance"),

        // ── MOBILITY / FLEXIBILITY ───────────────────────────────────────────
        new("Hip Flexor Stretch",
            "Kneel on one knee with other foot forward in lunge. Tuck pelvis and push hips forward gently until stretch is felt in front of rear hip.",
            "Hip Flexors", ["Quadriceps"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Pigeon Pose",
            "From downward dog, bring one shin forward parallel to wrists. Square hips, lower toward floor, fold torso over front leg. Hold.",
            "Gluteus Maximus", ["Hip Flexors", "Hip External Rotators"],
            ["mobility", "gymnastics", "beginner"],
            "bodyweight", "duration"),

        new("Thoracic Rotation",
            "On all fours or seated, rotate upper back by threading one arm under torso. Open shoulder toward ceiling by rotating thoracic spine.",
            "Thoracic Spine", ["Shoulder Girdle"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Cat-Cow",
            "On all fours. Arch back toward ceiling (cat), then drop belly toward floor and lift head (cow). Alternate smoothly with breathing.",
            "Spine", ["Core", "Erector Spinae"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Shoulder Dislocate",
            "Hold stick or band with wide grip behind body. With straight arms, raise overhead and behind until you feel full shoulder range. Return.",
            "Shoulder Girdle", ["Pectoralis Major", "Anterior Deltoid"],
            ["mobility", "gymnastics", "weightlifting", "beginner"],
            "bodyweight", "repetitions"),

        new("Hamstring Stretch",
            "Sit on floor with one leg extended, one bent. Hinge forward at hips keeping back flat to reach toward extended foot. Hold stretch.",
            "Hamstrings", ["Erector Spinae"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Calf Stretch",
            "Stand facing wall, place hands on it. Step one foot back with heel on floor and straight knee. Lean forward to stretch the calf.",
            "Gastrocnemius", ["Soleus", "Achilles Tendon"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Foam Roll IT Band",
            "Place foam roller under outer thigh, support body on hands. Roll from hip to knee slowly, pausing on tender spots for release.",
            "IT Band", ["Vastus Lateralis"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Child's Pose",
            "Kneel on floor, sit back on heels. Reach arms forward on floor and lower forehead to mat. Breathe deeply to release lower back tension.",
            "Spine", ["Shoulder Girdle", "Hip Flexors"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        new("Ankle Circles",
            "Seated or lying, lift one foot off floor. Rotate ankle in full circle clockwise and counterclockwise to improve joint mobility and flexibility.",
            "Ankle", ["Calves"],
            ["mobility", "beginner"],
            "bodyweight", "duration"),

        // ── MACHINE ──────────────────────────────────────────────────────────
        new("Leg Press Machine",
            "Sit in leg press, feet shoulder-width on platform. Push platform away by extending knees and hips, do not lock knees at top, lower slowly.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Leg Extension Machine",
            "Sit in machine, hook ankles under pad. Extend legs to nearly straight, squeeze quads at top, lower with control to starting position.",
            "Quadriceps", [],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Leg Curl Machine",
            "Lie prone or seated in machine, hook ankles over pad. Curl legs toward glutes by flexing hamstrings, squeeze at top, lower with control.",
            "Hamstrings", ["Calves"],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Lat Pulldown",
            "Grip bar wider than shoulder-width. Pull bar to upper chest by driving elbows down and back, lean back slightly, return to full extension.",
            "Latissimus Dorsi", ["Biceps", "Rhomboids"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Cable Row",
            "Sit at cable row, grip handle. Pull to lower ribcage by driving elbows back, squeeze shoulder blades, return to full arm extension.",
            "Latissimus Dorsi", ["Rhomboids", "Biceps", "Rear Deltoid"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Cable Fly",
            "Stand between high pulleys, grip handles. Bring hands together in front of chest in arc motion, squeezing pecs, return with control.",
            "Pectoralis Major", ["Anterior Deltoid"],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Cable Bicep Curl",
            "Grip cable bar or rope with supinated grip at waist height. Curl to shoulder height squeezing biceps at top, lower with resistance.",
            "Biceps", ["Forearms"],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Cable Tricep Pushdown",
            "Grip bar or rope at high cable. Keep elbows at sides, extend forearms downward until straight, squeeze triceps, return with control.",
            "Triceps", [],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Chest Press Machine",
            "Sit in machine, grip handles at chest level. Press forward to full extension, lower with control until handles return to chest level.",
            "Pectoralis Major", ["Anterior Deltoid", "Triceps"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Shoulder Press Machine",
            "Sit in machine, grip handles at shoulder height. Press overhead to full extension, lower with control. Guided path reduces stabilization.",
            "Anterior Deltoid", ["Medial Deltoid", "Triceps"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Pec Deck Fly",
            "Sit in machine, forearms on pads or grip handles. Bring arms together in front of chest squeezing pecs at contact, return with control.",
            "Pectoralis Major", ["Anterior Deltoid"],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Cable Lateral Raise",
            "Stand side-on to low cable, grip handle in far hand. Raise arm to shoulder height in lateral arc, lower with resistance. Constant tension.",
            "Medial Deltoid", ["Anterior Deltoid"],
            ["machine", "isolation", "bodybuilding", "intermediate"],
            "machine", "repetitions"),

        new("Smith Machine Squat",
            "Bar on traps inside Smith machine. Feet slightly forward of hips. Squat to parallel along guided path, press back to start.",
            "Quadriceps", ["Gluteus Maximus", "Hamstrings"],
            ["machine", "compound", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Hip Adductor Machine",
            "Sit in machine with legs on outer pads. Squeeze thighs together against resistance, return slowly. Targets inner thigh muscles.",
            "Adductors", [],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),

        new("Hip Abductor Machine",
            "Sit in machine with legs on inner pads. Push legs outward against resistance, return slowly. Targets outer hip and glute muscles.",
            "Abductors", ["Gluteus Medius"],
            ["machine", "isolation", "bodybuilding", "beginner"],
            "machine", "repetitions"),
    ];

    private record RawExercise(
        string Name,
        string Description,
        string PrimaryMuscle,
        string[] SecondaryMuscles,
        string[] Tags,
        string ActivityType,
        string ActivityTrackType);
}
