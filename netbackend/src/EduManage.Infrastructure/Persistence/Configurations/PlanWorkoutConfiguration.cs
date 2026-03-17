using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class PlanWorkoutConfiguration : IEntityTypeConfiguration<PlanWorkout>
{
    public void Configure(EntityTypeBuilder<PlanWorkout> builder)
    {
        builder.HasKey(pw => pw.Id);

        builder.HasOne(pw => pw.Plan)
            .WithMany(p => p.Workouts)
            .HasForeignKey(pw => pw.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(pw => pw.Exercises)
            .WithOne(re => re.PlanWorkout)
            .HasForeignKey(re => re.PlanWorkoutId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
