using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class FormTemplateVersionConfiguration : IEntityTypeConfiguration<FormTemplateVersion>
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public void Configure(EntityTypeBuilder<FormTemplateVersion> builder)
    {
        builder.HasKey(v => v.Id);

        builder.Property(v => v.FormTemplateId)
            .IsRequired();

        builder.Property(v => v.Fields)
            .HasConversion(
                fields => JsonSerializer.Serialize(fields, SerializerOptions),
                json => string.IsNullOrWhiteSpace(json)
                    ? new List<FormFieldDefinition>()
                    : JsonSerializer.Deserialize<List<FormFieldDefinition>>(json, SerializerOptions) ?? new List<FormFieldDefinition>())
            .Metadata.SetValueComparer(new ValueComparer<ICollection<FormFieldDefinition>>(
                (left, right) => Serialize(left) == Serialize(right),
                fields => Serialize(fields).GetHashCode(StringComparison.Ordinal),
                fields => Deserialize(Serialize(fields))));
    }

    private static string Serialize(ICollection<FormFieldDefinition>? fields)
    {
        var value = fields ?? new List<FormFieldDefinition>();
        return JsonSerializer.Serialize(value, SerializerOptions);
    }

    private static ICollection<FormFieldDefinition> Deserialize(string json)
    {
        return JsonSerializer.Deserialize<List<FormFieldDefinition>>(json, SerializerOptions) ?? new List<FormFieldDefinition>();
    }
}
