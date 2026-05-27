using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class DefaultWorkoutSetConfiguration : IEntityTypeConfiguration<DefaultWorkoutSet>
{
    public void Configure(EntityTypeBuilder<DefaultWorkoutSet> builder)
    {
        builder.HasKey(defaultWorkoutSet => defaultWorkoutSet.Id);

        builder.HasOne(defaultWorkoutSet => defaultWorkoutSet.DefaultWorkoutExercise)
            .WithMany(defaultWorkoutExercise => defaultWorkoutExercise.Sets)
            .HasForeignKey(defaultWorkoutSet => defaultWorkoutSet.DefaultWorkoutExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
