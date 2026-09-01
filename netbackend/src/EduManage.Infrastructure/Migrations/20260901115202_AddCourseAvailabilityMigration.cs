using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseAvailabilityMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceCurrency",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PriceValue",
                table: "Courses");

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Courses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CourseAvailabilities",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CourseId = table.Column<string>(type: "TEXT", nullable: false),
                    DaysOfWeek = table.Column<string>(type: "TEXT", nullable: false),
                    StartTime = table.Column<string>(type: "TEXT", nullable: false),
                    EndTime = table.Column<string>(type: "TEXT", nullable: false),
                    ValidFrom = table.Column<string>(type: "TEXT", nullable: true),
                    ValidTo = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseAvailabilities_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseAvailabilities_CourseId",
                table: "CourseAvailabilities",
                column: "CourseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseAvailabilities");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Courses");

            migrationBuilder.AddColumn<string>(
                name: "PriceCurrency",
                table: "Courses",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "PriceValue",
                table: "Courses",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
