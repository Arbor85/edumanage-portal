using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    InvitationCode = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.InvitationCode);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Size = table.Column<int>(type: "INTEGER", nullable: true),
                    PriceValue = table.Column<double>(type: "REAL", nullable: false),
                    PriceCurrency = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    ShortDescription = table.Column<string>(type: "TEXT", nullable: false),
                    PrimaryMuscle = table.Column<string>(type: "TEXT", nullable: false),
                    SecondaryMuscles = table.Column<string>(type: "TEXT", nullable: false),
                    Muscles = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Routines",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutHistory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CurrentUserId = table.Column<string>(type: "TEXT", nullable: false),
                    Mode = table.Column<string>(type: "TEXT", nullable: false),
                    StartedAt = table.Column<string>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<string>(type: "TEXT", nullable: false),
                    DurationSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalSets = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedSets = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    ClientId = table.Column<string>(type: "TEXT", nullable: false),
                    StartsAt = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<double>(type: "REAL", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meetings_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "InvitationCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    ClientId = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Plans_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "InvitationCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompletedExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkoutHistoryId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsBodyweight = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletedExercises_WorkoutHistory_WorkoutHistoryId",
                        column: x => x.WorkoutHistoryId,
                        principalTable: "WorkoutHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SourceWorkouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkoutHistoryId = table.Column<string>(type: "TEXT", nullable: false),
                    WorkoutId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SourceWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SourceWorkouts_WorkoutHistory_WorkoutHistoryId",
                        column: x => x.WorkoutHistoryId,
                        principalTable: "WorkoutHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanWorkouts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PlanId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: true),
                    Date = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanWorkouts_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompletedSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompletedExerciseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Reps = table.Column<int>(type: "INTEGER", nullable: true),
                    Weight = table.Column<double>(type: "REAL", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    Completed = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletedSets_CompletedExercises_CompletedExerciseId",
                        column: x => x.CompletedExerciseId,
                        principalTable: "CompletedExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoutineExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoutineId = table.Column<string>(type: "TEXT", nullable: false),
                    PlanWorkoutId = table.Column<string>(type: "TEXT", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsBodyweight = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutineExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutineExercises_PlanWorkouts_PlanWorkoutId",
                        column: x => x.PlanWorkoutId,
                        principalTable: "PlanWorkouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RoutineExercises_Routines_RoutineId",
                        column: x => x.RoutineId,
                        principalTable: "Routines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoutineSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoutineExerciseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Reps = table.Column<int>(type: "INTEGER", nullable: true),
                    Weight = table.Column<double>(type: "REAL", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutineSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutineSets_RoutineExercises_RoutineExerciseId",
                        column: x => x.RoutineExerciseId,
                        principalTable: "RoutineExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Exercises",
                columns: new[] { "Id", "Muscles", "Name", "PrimaryMuscle", "SecondaryMuscles", "ShortDescription", "Tags" },
                values: new object[,]
                {
                    { 1, "[{\"Name\":\"Quadriceps\"}]", "Squat", "Quadriceps", "Glutes,Hamstrings", "Back squat pattern", "Legs,Strength" },
                    { 2, "[{\"Name\":\"Pectorals\"}]", "Bench Press", "Chest", "Front Deltoids,Triceps", "Barbell horizontal press", "Chest,Strength" },
                    { 3, "[{\"Name\":\"Hamstrings\"}]", "Deadlift", "Posterior Chain", "Glutes,Lower Back", "Hip hinge pull", "Back,Strength" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompletedExercises_WorkoutHistoryId",
                table: "CompletedExercises",
                column: "WorkoutHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CompletedSets_CompletedExerciseId",
                table: "CompletedSets",
                column: "CompletedExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ClientId",
                table: "Meetings",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_ClientId",
                table: "Plans",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanWorkouts_PlanId",
                table: "PlanWorkouts",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutineExercises_PlanWorkoutId",
                table: "RoutineExercises",
                column: "PlanWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutineExercises_RoutineId",
                table: "RoutineExercises",
                column: "RoutineId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutineSets_RoutineExerciseId",
                table: "RoutineSets",
                column: "RoutineExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_SourceWorkouts_WorkoutHistoryId",
                table: "SourceWorkouts",
                column: "WorkoutHistoryId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompletedSets");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "RoutineSets");

            migrationBuilder.DropTable(
                name: "SourceWorkouts");

            migrationBuilder.DropTable(
                name: "CompletedExercises");

            migrationBuilder.DropTable(
                name: "RoutineExercises");

            migrationBuilder.DropTable(
                name: "WorkoutHistory");

            migrationBuilder.DropTable(
                name: "PlanWorkouts");

            migrationBuilder.DropTable(
                name: "Routines");

            migrationBuilder.DropTable(
                name: "Plans");

            migrationBuilder.DropTable(
                name: "Clients");
        }
    }
}
