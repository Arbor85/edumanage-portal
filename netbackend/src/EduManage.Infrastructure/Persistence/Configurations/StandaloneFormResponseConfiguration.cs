using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class StandaloneFormResponseConfiguration : IEntityTypeConfiguration<StandaloneFormResponse>
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public void Configure(EntityTypeBuilder<StandaloneFormResponse> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.FormTemplateId).IsRequired();
        builder.Property(r => r.FormTemplateVersionId).IsRequired();
        builder.Property(r => r.TrainerUserId).IsRequired();
        builder.Property(r => r.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(r => r.LastName).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Gender).HasMaxLength(50);

        builder.HasOne(r => r.FormTemplate)
            .WithMany()
            .HasForeignKey(r => r.FormTemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.FormTemplateVersion)
            .WithMany()
            .HasForeignKey(r => r.FormTemplateVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(r => r.Answers)
            .HasConversion(
                answers => JsonSerializer.Serialize(answers, SerializerOptions),
                json => string.IsNullOrWhiteSpace(json)
                    ? new List<FormAnswer>()
                    : JsonSerializer.Deserialize<List<FormAnswer>>(json, SerializerOptions) ?? new List<FormAnswer>())
            .Metadata.SetValueComparer(new ValueComparer<List<FormAnswer>>(
                (left, right) => Serialize(left) == Serialize(right),
                answers => Serialize(answers).GetHashCode(StringComparison.Ordinal),
                answers => Deserialize(Serialize(answers))));
    }

    private static string Serialize(List<FormAnswer>? answers) =>
        JsonSerializer.Serialize(answers ?? new List<FormAnswer>(), SerializerOptions);

    private static List<FormAnswer> Deserialize(string json) =>
        JsonSerializer.Deserialize<List<FormAnswer>>(json, SerializerOptions) ?? new List<FormAnswer>();
}
