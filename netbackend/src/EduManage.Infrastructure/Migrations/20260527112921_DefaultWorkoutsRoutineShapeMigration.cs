using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DefaultWorkoutsRoutineShapeMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefaultWorkouts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultWorkouts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DefaultWorkoutExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DefaultWorkoutId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsBodyweight = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultWorkoutExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DefaultWorkoutExercises_DefaultWorkouts_DefaultWorkoutId",
                        column: x => x.DefaultWorkoutId,
                        principalTable: "DefaultWorkouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DefaultWorkoutSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DefaultWorkoutExerciseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Reps = table.Column<int>(type: "INTEGER", nullable: true),
                    Weight = table.Column<double>(type: "REAL", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultWorkoutSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DefaultWorkoutSets_DefaultWorkoutExercises_DefaultWorkoutExerciseId",
                        column: x => x.DefaultWorkoutExerciseId,
                        principalTable: "DefaultWorkoutExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DefaultWorkoutExercises_DefaultWorkoutId",
                table: "DefaultWorkoutExercises",
                column: "DefaultWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_DefaultWorkoutSets_DefaultWorkoutExerciseId",
                table: "DefaultWorkoutSets",
                column: "DefaultWorkoutExerciseId");

            migrationBuilder.Sql(@"
INSERT INTO DefaultWorkouts (Id, Name, Notes)
VALUES
('default-wod-001', 'EMOM Full Body Burner', '20-minute EMOM focused on conditioning and total-body volume.'),
('default-wod-002', 'Leg Day Ladder', 'Progressive rep ladder centered on lower-body strength endurance.'),
('default-wod-003', 'Core Crusher Circuit', 'Core-focused circuit with anti-extension and rotational work.');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Burpee', 'Full-body explosive movement from plank to jump.', 'Full Body', '', '[{""Name"":""Full Body""}]', 'conditioning', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Burpee');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Goblet Squat', 'Front-loaded squat emphasizing quads and trunk.', 'Quadriceps', 'Glutes,Hamstrings', '[{""Name"":""Quadriceps""}]', 'strength', 0
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Goblet Squat');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Sit-up', 'Trunk flexion bodyweight exercise.', 'Abdominals', '', '[{""Name"":""Abdominals""}]', 'core', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Sit-up');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Dumbbell Lunge', 'Unilateral lower-body strength movement.', 'Quadriceps', 'Glutes,Hamstrings', '[{""Name"":""Quadriceps""}]', 'strength', 0
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Dumbbell Lunge');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Kettlebell Deadlift', 'Hip-hinge pattern for posterior chain strength.', 'Hamstrings', 'Glutes,Lower Back', '[{""Name"":""Hamstrings""}]', 'strength', 0
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Kettlebell Deadlift');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Jump Squat', 'Explosive squat variation for power output.', 'Quadriceps', 'Glutes,Calves', '[{""Name"":""Quadriceps""}]', 'power', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Jump Squat');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Plank', 'Isometric core stability hold.', 'Abdominals', 'Obliques,Lower Back', '[{""Name"":""Abdominals""}]', 'core', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Plank');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Russian Twist', 'Rotational core movement.', 'Obliques', 'Abdominals', '[{""Name"":""Obliques""}]', 'core', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Russian Twist');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'V-up', 'Advanced anterior core bodyweight movement.', 'Abdominals', 'Hip Flexors', '[{""Name"":""Abdominals""}]', 'core', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'V-up');

INSERT INTO Exercises (Name, ShortDescription, PrimaryMuscle, SecondaryMuscles, Muscles, Tags, IsBodyweight)
SELECT 'Mountain Climber', 'Dynamic core and conditioning drill.', 'Abdominals', 'Shoulders,Hip Flexors', '[{""Name"":""Abdominals""}]', 'conditioning', 1
WHERE NOT EXISTS (SELECT 1 FROM Exercises WHERE Name = 'Mountain Climber');

INSERT INTO DefaultWorkoutExercises (DefaultWorkoutId, Name, IsBodyweight)
VALUES
('default-wod-001', 'Burpee', 1),
('default-wod-001', 'Goblet Squat', 0),
('default-wod-001', 'Sit-up', 1),
('default-wod-002', 'Dumbbell Lunge', 0),
('default-wod-002', 'Kettlebell Deadlift', 0),
('default-wod-002', 'Jump Squat', 1),
('default-wod-003', 'Plank', 1),
('default-wod-003', 'Russian Twist', 1),
('default-wod-003', 'V-up', 1),
('default-wod-003', 'Mountain Climber', 1);

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'time', NULL, NULL, '60 seconds each minute for 20 rounds' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-001' AND Name = 'Burpee';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 12, NULL, 'Use moderate load' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-001' AND Name = 'Goblet Squat';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 14, NULL, 'Controlled tempo' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-001' AND Name = 'Sit-up';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 10, NULL, 'Per leg' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-002' AND Name = 'Dumbbell Lunge';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 10, NULL, 'Kettlebell moderate-heavy load' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-002' AND Name = 'Kettlebell Deadlift';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 12, NULL, 'Explosive effort' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-002' AND Name = 'Jump Squat';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'time', NULL, NULL, '30 seconds hold' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-003' AND Name = 'Plank';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 20, NULL, 'Total reps' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-003' AND Name = 'Russian Twist';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 15, NULL, 'Strict reps' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-003' AND Name = 'V-up';

INSERT INTO DefaultWorkoutSets (DefaultWorkoutExerciseId, Type, Reps, Weight, Notes)
SELECT Id, 'reps', 20, NULL, '10 per side' FROM DefaultWorkoutExercises WHERE DefaultWorkoutId = 'default-wod-003' AND Name = 'Mountain Climber';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DefaultWorkoutSets");

            migrationBuilder.DropTable(
                name: "DefaultWorkoutExercises");

            migrationBuilder.DropTable(
                name: "DefaultWorkouts");
        }
    }
}
