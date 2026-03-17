using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure;

internal sealed class EduManageDbContext(DbContextOptions<EduManageDbContext> options) : DbContext(options)
{
    public DbSet<StoredDocument> Documents => Set<StoredDocument>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<StoredDocument>(builder =>
        {
            builder.HasKey(document => document.StorageKey);
            builder.Property(document => document.StorageKey).IsRequired();
            builder.Property(document => document.Category).IsRequired();
            builder.Property(document => document.DocumentId).IsRequired();
            builder.Property(document => document.Payload).IsRequired();
            builder.HasIndex(document => new { document.Category, document.DocumentId }).IsUnique();
        });
    }
}

internal sealed class StoredDocument
{
    public string StorageKey { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
}
