using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsBodyweightToExerciseMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBodyweight",
                table: "Exercises",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBodyweight",
                table: "Exercises");
        }
    }
}
