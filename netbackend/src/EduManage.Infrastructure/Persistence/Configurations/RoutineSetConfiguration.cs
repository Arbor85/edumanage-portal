using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class RoutineSetConfiguration : IEntityTypeConfiguration<RoutineSet>
{
    public void Configure(EntityTypeBuilder<RoutineSet> builder)
    {
        builder.HasKey(rs => rs.Id);

        builder.HasOne(rs => rs.RoutineExercise)
            .WithMany(re => re.Sets)
            .HasForeignKey(rs => rs.RoutineExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
