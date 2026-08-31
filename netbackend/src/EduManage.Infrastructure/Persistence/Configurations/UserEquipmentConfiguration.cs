using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
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
                v => v == null ? null : JsonSerializer.Deserialize<List<decimal>>(v, (JsonSerializerOptions?)null))
            .Metadata.SetValueComparer(new ValueComparer<List<decimal>?>(
                (a, b) => a == null && b == null || (a != null && b != null && a.SequenceEqual(b)),
                v => v == null ? 0 : v.Aggregate(0, (a, i) => HashCode.Combine(a, i.GetHashCode())),
                v => v == null ? null : v.ToList()));
    }
}
