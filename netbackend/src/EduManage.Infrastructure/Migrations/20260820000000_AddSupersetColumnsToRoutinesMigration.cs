using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupersetColumnsToRoutinesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SupersetGroupsJson",
                table: "Routines",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "SupersetGroupId",
                table: "RoutineExercises",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DropConfigJson",
                table: "RoutineExercises",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SupersetGroupsJson",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "SupersetGroupId",
                table: "RoutineExercises");

            migrationBuilder.DropColumn(
                name: "DropConfigJson",
                table: "RoutineExercises");
        }
    }
}
