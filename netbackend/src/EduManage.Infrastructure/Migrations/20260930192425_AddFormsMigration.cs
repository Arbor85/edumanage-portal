using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFormsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormTemplates",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CurrentVersion = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormTemplateVersions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FormTemplateId = table.Column<string>(type: "TEXT", nullable: false),
                    VersionNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Fields = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormTemplateVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormTemplateVersions_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormResponses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FormTemplateId = table.Column<string>(type: "TEXT", nullable: false),
                    FormTemplateVersionId = table.Column<string>(type: "TEXT", nullable: false),
                    ClientId = table.Column<string>(type: "TEXT", nullable: false),
                    MeetingId = table.Column<string>(type: "TEXT", nullable: true),
                    FilledByUserId = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false),
                    Answers = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormResponses_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "InvitationCode",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormResponses_FormTemplateVersions_FormTemplateVersionId",
                        column: x => x.FormTemplateVersionId,
                        principalTable: "FormTemplateVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormResponses_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormResponses_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_ClientId",
                table: "FormResponses",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_FormTemplateId",
                table: "FormResponses",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_FormTemplateVersionId",
                table: "FormResponses",
                column: "FormTemplateVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_MeetingId",
                table: "FormResponses",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_FormTemplateVersions_FormTemplateId",
                table: "FormTemplateVersions",
                column: "FormTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormResponses");

            migrationBuilder.DropTable(
                name: "FormTemplateVersions");

            migrationBuilder.DropTable(
                name: "FormTemplates");
        }
    }
}
