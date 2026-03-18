using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class CompletedSetConfiguration : IEntityTypeConfiguration<CompletedSet>
{
    public void Configure(EntityTypeBuilder<CompletedSet> builder)
    {
        builder.HasKey(cs => cs.Id);

        builder.HasOne(cs => cs.CompletedExercise)
            .WithMany(ce => ce.Sets)
            .HasForeignKey(cs => cs.CompletedExerciseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
