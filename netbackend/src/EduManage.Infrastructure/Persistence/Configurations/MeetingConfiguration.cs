using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class MeetingConfiguration : IEntityTypeConfiguration<Meeting>
{
    public void Configure(EntityTypeBuilder<Meeting> builder)
    {
        builder.HasKey(m => m.Id);

        builder.HasOne(m => m.Client)
            .WithMany(c => c.Meetings)
            .HasForeignKey(m => m.ClientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
