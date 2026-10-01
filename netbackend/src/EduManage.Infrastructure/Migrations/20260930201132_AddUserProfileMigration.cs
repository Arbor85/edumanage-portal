using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Equipment = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserProfiles");
        }
    }
}
