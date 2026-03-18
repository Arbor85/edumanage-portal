using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(c => c.InvitationCode);
        
        builder.Property(c => c.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.None).ToList());

        builder.HasMany(c => c.Plans)
            .WithOne(p => p.Client)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Meetings)
            .WithOne(m => m.Client)
            .HasForeignKey(m => m.ClientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
