using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class QueuedWorkoutConfiguration : IEntityTypeConfiguration<QueuedWorkout>
{
    public void Configure(EntityTypeBuilder<QueuedWorkout> builder)
    {
        builder.HasKey(q => q.Id);
        builder.HasIndex(q => q.UserId);
    }
}
