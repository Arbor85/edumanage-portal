using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScheduleEntryNewModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "ScheduleEntries");

            migrationBuilder.DropColumn(
                name: "IsRecurring",
                table: "ScheduleEntries");

            migrationBuilder.DropColumn(
                name: "ValidFrom",
                table: "ScheduleEntries");

            migrationBuilder.RenameColumn(
                name: "ValidTo",
                table: "ScheduleEntries",
                newName: "ValidUntil");

            migrationBuilder.RenameColumn(
                name: "DaysOfWeek",
                table: "ScheduleEntries",
                newName: "StartDate");

            migrationBuilder.AlterColumn<string>(
                name: "ValidTo",
                table: "TrainerAvailabilities",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "ValidFrom",
                table: "TrainerAvailabilities",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceInterval",
                table: "ScheduleEntries",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceType",
                table: "ScheduleEntries",
                type: "TEXT",
                nullable: false,
                defaultValue: "none");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "OrganizationMemberships",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "OrganizationMemberships",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ValidTo",
                table: "BuildingAvailabilities",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "ValidFrom",
                table: "BuildingAvailabilities",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecurrenceInterval",
                table: "ScheduleEntries");

            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                table: "ScheduleEntries");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "OrganizationMemberships");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "OrganizationMemberships");

            migrationBuilder.RenameColumn(
                name: "ValidUntil",
                table: "ScheduleEntries",
                newName: "ValidTo");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "ScheduleEntries",
                newName: "DaysOfWeek");

            migrationBuilder.AlterColumn<string>(
                name: "ValidTo",
                table: "TrainerAvailabilities",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ValidFrom",
                table: "TrainerAvailabilities",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Date",
                table: "ScheduleEntries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRecurring",
                table: "ScheduleEntries",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ValidFrom",
                table: "ScheduleEntries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ValidTo",
                table: "BuildingAvailabilities",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ValidFrom",
                table: "BuildingAvailabilities",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);
        }
    }
}
