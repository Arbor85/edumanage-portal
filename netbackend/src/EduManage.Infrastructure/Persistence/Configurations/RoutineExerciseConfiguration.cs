using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class RoutineExerciseConfiguration : IEntityTypeConfiguration<RoutineExercise>
{
    public void Configure(EntityTypeBuilder<RoutineExercise> builder)
    {
        builder.HasKey(re => re.Id);

        builder.HasOne(re => re.Routine)
            .WithMany(r => r.Exercises)
            .HasForeignKey(re => re.RoutineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(re => re.PlanWorkout)
            .WithMany(pw => pw.Exercises)
            .HasForeignKey(re => re.PlanWorkoutId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(re => re.Sets)
            .WithOne(rs => rs.RoutineExercise)
            .HasForeignKey(rs => rs.RoutineExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
