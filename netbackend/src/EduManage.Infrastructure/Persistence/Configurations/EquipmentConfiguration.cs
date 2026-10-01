using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class EquipmentConfiguration : IEntityTypeConfiguration<Equipment>
{
    public void Configure(EntityTypeBuilder<Equipment> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).HasMaxLength(100);

        builder.Property(e => e.EquipmentType).HasConversion<int>();

        builder.Property(e => e.WeightOptions)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<decimal>>(v, (JsonSerializerOptions?)null))
            .Metadata.SetValueComparer(new ValueComparer<List<decimal>?>(
                (l, r) => l == null && r == null || (l != null && r != null && l.SequenceEqual(r)),
                v => v == null ? 0 : v.Aggregate(0, (h, d) => HashCode.Combine(h, d.GetHashCode())),
                v => v == null ? null : v.ToList()));
    }
}
