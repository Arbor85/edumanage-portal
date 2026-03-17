using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class WorkoutHistoryConfiguration : IEntityTypeConfiguration<WorkoutHistory>
{
    public void Configure(EntityTypeBuilder<WorkoutHistory> builder)
    {
        builder.HasKey(wh => wh.Id);

        builder.HasMany(wh => wh.Exercises)
            .WithOne(ce => ce.WorkoutHistory)
            .HasForeignKey(ce => ce.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wh => wh.SourceWorkout)
            .WithOne(sw => sw.WorkoutHistory)
            .HasForeignKey<SourceWorkout>(sw => sw.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
