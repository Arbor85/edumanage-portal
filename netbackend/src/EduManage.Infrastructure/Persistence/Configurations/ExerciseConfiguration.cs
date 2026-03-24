using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class ExerciseConfiguration : IEntityTypeConfiguration<Exercise>
{
    public void Configure(EntityTypeBuilder<Exercise> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.None).ToList());

        builder.Property(e => e.SecondaryMuscles)
            .HasConversion(
                v => string.Join(",", v),
                v => string.IsNullOrEmpty(v)
                    ? new List<string>()
                    : v.Split(",", StringSplitOptions.None).ToList());

        builder.Property(e => e.Muscles)
            .HasConversion(
                muscles => JsonSerializer.Serialize(muscles, (JsonSerializerOptions?)null),
                json => (IReadOnlyList<Muscle>)(JsonSerializer.Deserialize<List<Muscle>>(json, (JsonSerializerOptions?)null) ?? new List<Muscle>()));
    }
}
