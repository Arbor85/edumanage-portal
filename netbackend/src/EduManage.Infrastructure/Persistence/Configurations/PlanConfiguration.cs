using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.Client)
            .WithMany(c => c.Plans)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Workouts)
            .WithOne(pw => pw.Plan)
            .HasForeignKey(pw => pw.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
