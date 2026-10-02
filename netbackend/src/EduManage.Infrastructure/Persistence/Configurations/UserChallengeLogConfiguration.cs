using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class UserChallengeLogConfiguration : IEntityTypeConfiguration<UserChallengeLog>
{
    public void Configure(EntityTypeBuilder<UserChallengeLog> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ChallengeDate });
        builder.Property(x => x.UserId).HasMaxLength(200);
    }
}
