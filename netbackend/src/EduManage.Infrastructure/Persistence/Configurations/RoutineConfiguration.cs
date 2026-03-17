using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class RoutineConfiguration : IEntityTypeConfiguration<Routine>
{
    public void Configure(EntityTypeBuilder<Routine> builder)
    {
        builder.HasKey(r => r.Id);

        builder.HasMany(r => r.Exercises)
            .WithOne(re => re.Routine)
            .HasForeignKey(re => re.RoutineId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
