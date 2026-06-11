using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class UserEquipmentConfiguration : IEntityTypeConfiguration<UserEquipment>
{
    public void Configure(EntityTypeBuilder<UserEquipment> builder)
    {
        builder.HasKey(ue => ue.Id);

        builder.HasIndex(ue => ue.UserId);

        builder.HasOne(ue => ue.Equipment)
            .WithMany()
            .HasForeignKey(ue => ue.EquipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(ue => ue.AvailableWeights)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<decimal>>(v, (JsonSerializerOptions?)null));
    }
}
