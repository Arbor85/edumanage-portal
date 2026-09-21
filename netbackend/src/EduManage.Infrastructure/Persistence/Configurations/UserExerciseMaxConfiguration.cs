using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class UserExerciseMaxConfiguration : IEntityTypeConfiguration<UserExerciseMax>
{
    public void Configure(EntityTypeBuilder<UserExerciseMax> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ExerciseId });
        builder.HasOne(x => x.Exercise)
               .WithMany()
               .HasForeignKey(x => x.ExerciseId);
    }
}
