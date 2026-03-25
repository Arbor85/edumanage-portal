using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PlanExcercisesRestructureMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercises_PlanWorkouts_PlanWorkoutId",
                table: "RoutineExercises");

            migrationBuilder.DropTable(
                name: "PlanWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_RoutineExercises_PlanWorkoutId",
                table: "RoutineExercises");

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AddColumn<string>(
                name: "Workouts",
                table: "Plans",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Workouts",
                table: "Plans");

            migrationBuilder.CreateTable(
                name: "PlanWorkouts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PlanId = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: true)
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
                name: "IX_RoutineExercises_PlanWorkoutId",
                table: "RoutineExercises",
                column: "PlanWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanWorkouts_PlanId",
                table: "PlanWorkouts",
                column: "PlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercises_PlanWorkouts_PlanWorkoutId",
                table: "RoutineExercises",
                column: "PlanWorkoutId",
                principalTable: "PlanWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
