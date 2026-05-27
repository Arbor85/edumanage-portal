using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class DefaultWorkoutConfiguration : IEntityTypeConfiguration<DefaultWorkout>
{
    public void Configure(EntityTypeBuilder<DefaultWorkout> builder)
    {
        builder.HasKey(defaultWorkout => defaultWorkout.Id);

        builder.HasMany(defaultWorkout => defaultWorkout.Exercises)
            .WithOne(defaultWorkoutExercise => defaultWorkoutExercise.DefaultWorkout)
            .HasForeignKey(defaultWorkoutExercise => defaultWorkoutExercise.DefaultWorkoutId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
