using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class FormTemplateConfiguration : IEntityTypeConfiguration<FormTemplate>
{
    public void Configure(EntityTypeBuilder<FormTemplate> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.TrainerUserId)
            .IsRequired();

        builder.HasMany(f => f.Versions)
            .WithOne(v => v.FormTemplate)
            .HasForeignKey(v => v.FormTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(f => f.Responses)
            .WithOne(r => r.FormTemplate)
            .HasForeignKey(r => r.FormTemplateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
