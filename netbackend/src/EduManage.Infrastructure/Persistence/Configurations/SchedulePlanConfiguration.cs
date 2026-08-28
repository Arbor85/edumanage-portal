using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class SchedulePlanConfiguration : IEntityTypeConfiguration<SchedulePlan>
{
    public void Configure(EntityTypeBuilder<SchedulePlan> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Status).HasDefaultValue("Draft");
        builder.HasMany(p => p.Entries)
            .WithOne(e => e.Plan)
            .HasForeignKey(e => e.SchedulePlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
