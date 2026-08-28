using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizerScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Buildings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizationId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    Capacity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buildings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    OwnerId = table.Column<string>(type: "TEXT", nullable: false),
                    InviteCode = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SchedulePlans",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizationId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "Draft"),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchedulePlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainerAvailabilities",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizationId = table.Column<string>(type: "TEXT", nullable: false),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    DaysOfWeek = table.Column<string>(type: "TEXT", nullable: false),
                    StartTime = table.Column<string>(type: "TEXT", nullable: false),
                    EndTime = table.Column<string>(type: "TEXT", nullable: false),
                    ValidFrom = table.Column<string>(type: "TEXT", nullable: false),
                    ValidTo = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerAvailabilities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainerCourseAssociations",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizationId = table.Column<string>(type: "TEXT", nullable: false),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    CourseId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerCourseAssociations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BuildingAvailabilities",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    BuildingId = table.Column<string>(type: "TEXT", nullable: false),
                    DaysOfWeek = table.Column<string>(type: "TEXT", nullable: false),
                    StartTime = table.Column<string>(type: "TEXT", nullable: false),
                    EndTime = table.Column<string>(type: "TEXT", nullable: false),
                    ValidFrom = table.Column<string>(type: "TEXT", nullable: false),
                    ValidTo = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuildingAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuildingAvailabilities_Buildings_BuildingId",
                        column: x => x.BuildingId,
                        principalTable: "Buildings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationMemberships",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizationId = table.Column<string>(type: "TEXT", nullable: false),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    JoinedAt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationMemberships_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScheduleEntries",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    SchedulePlanId = table.Column<string>(type: "TEXT", nullable: false),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    BuildingId = table.Column<string>(type: "TEXT", nullable: false),
                    CourseId = table.Column<string>(type: "TEXT", nullable: false),
                    IsRecurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    DaysOfWeek = table.Column<string>(type: "TEXT", nullable: false),
                    ValidFrom = table.Column<string>(type: "TEXT", nullable: true),
                    ValidTo = table.Column<string>(type: "TEXT", nullable: true),
                    StartTime = table.Column<string>(type: "TEXT", nullable: false),
                    EndTime = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: true),
                    HasMismatch = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduleEntries_SchedulePlans_SchedulePlanId",
                        column: x => x.SchedulePlanId,
                        principalTable: "SchedulePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuildingAvailabilities_BuildingId",
                table: "BuildingAvailabilities",
                column: "BuildingId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMemberships_OrganizationId",
                table: "OrganizationMemberships",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleEntries_SchedulePlanId",
                table: "ScheduleEntries",
                column: "SchedulePlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuildingAvailabilities");

            migrationBuilder.DropTable(
                name: "OrganizationMemberships");

            migrationBuilder.DropTable(
                name: "ScheduleEntries");

            migrationBuilder.DropTable(
                name: "TrainerAvailabilities");

            migrationBuilder.DropTable(
                name: "TrainerCourseAssociations");

            migrationBuilder.DropTable(
                name: "Buildings");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropTable(
                name: "SchedulePlans");
        }
    }
}
