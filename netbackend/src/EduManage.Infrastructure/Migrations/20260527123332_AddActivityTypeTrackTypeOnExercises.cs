using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityTypeTrackTypeOnExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsBodyweight",
                table: "RoutineExercises",
                newName: "ActivityType");

            migrationBuilder.RenameColumn(
                name: "IsBodyweight",
                table: "Exercises",
                newName: "ActivityType");

            migrationBuilder.RenameColumn(
                name: "IsBodyweight",
                table: "DefaultWorkoutExercises",
                newName: "ActivityType");

            migrationBuilder.RenameColumn(
                name: "IsBodyweight",
                table: "CompletedExercises",
                newName: "ActivityType");

            migrationBuilder.Sql(@"
UPDATE Exercises
SET ActivityType = CASE WHEN ActivityType = 1 THEN 2 ELSE 0 END;

UPDATE RoutineExercises
SET ActivityType = CASE WHEN ActivityType = 1 THEN 2 ELSE 0 END;

UPDATE CompletedExercises
SET ActivityType = CASE WHEN ActivityType = 1 THEN 2 ELSE 0 END;

UPDATE DefaultWorkoutExercises
SET ActivityType = CASE WHEN ActivityType = 1 THEN 2 ELSE 0 END;
");

            migrationBuilder.AddColumn<int>(
                name: "Distance",
                table: "RoutineSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "RoutineSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActivityTrackType",
                table: "RoutineExercises",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ActivityTrackType",
                table: "Exercises",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Distance",
                table: "DefaultWorkoutSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "DefaultWorkoutSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActivityTrackType",
                table: "DefaultWorkoutExercises",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Distance",
                table: "CompletedSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "CompletedSets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActivityTrackType",
                table: "CompletedExercises",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Distance",
                table: "RoutineSets");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "RoutineSets");

            migrationBuilder.DropColumn(
                name: "ActivityTrackType",
                table: "RoutineExercises");

            migrationBuilder.DropColumn(
                name: "ActivityTrackType",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "Distance",
                table: "DefaultWorkoutSets");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "DefaultWorkoutSets");

            migrationBuilder.DropColumn(
                name: "ActivityTrackType",
                table: "DefaultWorkoutExercises");

            migrationBuilder.DropColumn(
                name: "Distance",
                table: "CompletedSets");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "CompletedSets");

            migrationBuilder.DropColumn(
                name: "ActivityTrackType",
                table: "CompletedExercises");

            migrationBuilder.Sql(@"
UPDATE Exercises
SET ActivityType = CASE WHEN ActivityType = 2 THEN 1 ELSE 0 END;

UPDATE RoutineExercises
SET ActivityType = CASE WHEN ActivityType = 2 THEN 1 ELSE 0 END;

UPDATE CompletedExercises
SET ActivityType = CASE WHEN ActivityType = 2 THEN 1 ELSE 0 END;

UPDATE DefaultWorkoutExercises
SET ActivityType = CASE WHEN ActivityType = 2 THEN 1 ELSE 0 END;
");

            migrationBuilder.RenameColumn(
                name: "ActivityType",
                table: "RoutineExercises",
                newName: "IsBodyweight");

            migrationBuilder.RenameColumn(
                name: "ActivityType",
                table: "Exercises",
                newName: "IsBodyweight");

            migrationBuilder.RenameColumn(
                name: "ActivityType",
                table: "DefaultWorkoutExercises",
                newName: "IsBodyweight");

            migrationBuilder.RenameColumn(
                name: "ActivityType",
                table: "CompletedExercises",
                newName: "IsBodyweight");
        }
    }
}
