using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class CompletedExerciseConfiguration : IEntityTypeConfiguration<CompletedExercise>
{
    public void Configure(EntityTypeBuilder<CompletedExercise> builder)
    {
        builder.HasKey(ce => ce.Id);

        builder.HasOne(ce => ce.WorkoutHistory)
            .WithMany(wh => wh.Exercises)
            .HasForeignKey(ce => ce.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(ce => ce.Sets)
            .WithOne(cs => cs.CompletedExercise)
            .HasForeignKey(cs => cs.CompletedExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
