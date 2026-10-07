using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

internal sealed class BodyMeasurementConfiguration : IEntityTypeConfiguration<BodyMeasurement>
{
    public void Configure(EntityTypeBuilder<BodyMeasurement> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasMaxLength(32).IsRequired();
        builder.Property(m => m.UserId).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Date).HasColumnType("date").IsRequired();
        builder.HasIndex(m => new { m.UserId, m.Date });
    }
}
