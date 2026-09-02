using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class McpApiKeyConfiguration : IEntityTypeConfiguration<McpApiKey>
{
    public void Configure(EntityTypeBuilder<McpApiKey> builder)
    {
        builder.HasKey(k => k.Id);
        builder.HasIndex(k => k.Key).IsUnique();
    }
}
