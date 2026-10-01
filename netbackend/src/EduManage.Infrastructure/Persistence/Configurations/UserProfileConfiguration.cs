using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(p => p.UserId);

        builder.Property(p => p.UserId).HasMaxLength(200);

        builder.Property(p => p.Equipment)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new())
            .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                (l, r) => l != null && r != null && l.SequenceEqual(r),
                v => v.Aggregate(0, (h, s) => HashCode.Combine(h, s.GetHashCode(StringComparison.Ordinal))),
                v => v.ToList()));
    }
}
