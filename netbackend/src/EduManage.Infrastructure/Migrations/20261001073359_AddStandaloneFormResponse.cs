using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStandaloneFormResponse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StandaloneFormResponses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FormTemplateId = table.Column<string>(type: "TEXT", nullable: false),
                    FormTemplateVersionId = table.Column<string>(type: "TEXT", nullable: false),
                    TrainerUserId = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Age = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false),
                    Answers = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StandaloneFormResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StandaloneFormResponses_FormTemplateVersions_FormTemplateVersionId",
                        column: x => x.FormTemplateVersionId,
                        principalTable: "FormTemplateVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StandaloneFormResponses_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StandaloneFormResponses_FormTemplateId",
                table: "StandaloneFormResponses",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_StandaloneFormResponses_FormTemplateVersionId",
                table: "StandaloneFormResponses",
                column: "FormTemplateVersionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StandaloneFormResponses");
        }
    }
}
