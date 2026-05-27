using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class DefaultWorkoutExerciseConfiguration : IEntityTypeConfiguration<DefaultWorkoutExercise>
{
    public void Configure(EntityTypeBuilder<DefaultWorkoutExercise> builder)
    {
        builder.HasKey(defaultWorkoutExercise => defaultWorkoutExercise.Id);

        builder.HasOne(defaultWorkoutExercise => defaultWorkoutExercise.DefaultWorkout)
            .WithMany(defaultWorkout => defaultWorkout.Exercises)
            .HasForeignKey(defaultWorkoutExercise => defaultWorkoutExercise.DefaultWorkoutId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(defaultWorkoutExercise => defaultWorkoutExercise.Sets)
            .WithOne(defaultWorkoutSet => defaultWorkoutSet.DefaultWorkoutExercise)
            .HasForeignKey(defaultWorkoutSet => defaultWorkoutSet.DefaultWorkoutExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
