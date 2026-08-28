using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class BuildingAvailabilityConfiguration : IEntityTypeConfiguration<BuildingAvailability>
{
    public void Configure(EntityTypeBuilder<BuildingAvailability> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.DaysOfWeek)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList());
    }
}
