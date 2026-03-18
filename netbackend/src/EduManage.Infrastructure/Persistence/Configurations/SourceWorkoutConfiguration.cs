using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class SourceWorkoutConfiguration : IEntityTypeConfiguration<SourceWorkout>
{
    public void Configure(EntityTypeBuilder<SourceWorkout> builder)
    {
        builder.HasKey(sw => sw.Id);

        builder.HasOne(sw => sw.WorkoutHistory)
            .WithOne(wh => wh.SourceWorkout)
            .HasForeignKey<SourceWorkout>(sw => sw.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
