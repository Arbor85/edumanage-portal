using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class FormResponseConfiguration : IEntityTypeConfiguration<FormResponse>
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public void Configure(EntityTypeBuilder<FormResponse> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.FormTemplateId)
            .IsRequired();

        builder.Property(r => r.FormTemplateVersionId)
            .IsRequired();

        builder.Property(r => r.ClientId)
            .IsRequired();

        builder.HasOne(r => r.Client)
            .WithMany()
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Meeting)
            .WithMany()
            .HasForeignKey(r => r.MeetingId)
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

    private static string Serialize(List<FormAnswer>? answers)
    {
        var value = answers ?? new List<FormAnswer>();
        return JsonSerializer.Serialize(value, SerializerOptions);
    }

    private static List<FormAnswer> Deserialize(string json)
    {
        return JsonSerializer.Deserialize<List<FormAnswer>>(json, SerializerOptions) ?? new List<FormAnswer>();
    }
}
