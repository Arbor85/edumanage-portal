using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class UserExercisePreferenceConfiguration : IEntityTypeConfiguration<UserExercisePreference>
{
    public void Configure(EntityTypeBuilder<UserExercisePreference> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ExerciseId });
    }
}
