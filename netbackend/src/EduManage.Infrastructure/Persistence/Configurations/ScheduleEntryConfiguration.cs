using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class ScheduleEntryConfiguration : IEntityTypeConfiguration<ScheduleEntry>
{
    public void Configure(EntityTypeBuilder<ScheduleEntry> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.RecurrenceType).HasDefaultValue("none");
        builder.Property(e => e.RecurrenceInterval).IsRequired(false);
        builder.Property(e => e.ValidUntil).IsRequired(false);
    }
}
