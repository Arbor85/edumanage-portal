using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduManage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEquipmentIsCoreSeedMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCore",
                table: "Equipment",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                INSERT INTO Equipment (Id, Name, EquipmentType, WeightOptions, IsCore) VALUES
                ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Barbell',      1, '[5,10,15,20,25]',          1),
                ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Kettlebell',   1, '[8,10,16,20,25]',          1),
                ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Dumbbell',     1, '[2,4,6,8,10,12,14,16]',   1),
                ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Pull-up bar',  0, NULL,                       1),
                ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Dip rings',    0, NULL,                       1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Equipment WHERE Id IN (
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567804',
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567805'
                );
            ");

            migrationBuilder.DropColumn(
                name: "IsCore",
                table: "Equipment");
        }
    }
}
