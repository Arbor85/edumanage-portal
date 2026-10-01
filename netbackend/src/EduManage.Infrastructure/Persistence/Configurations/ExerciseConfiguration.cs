using System.Text.Json;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class ExerciseConfiguration : IEntityTypeConfiguration<Exercise>
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    private static ValueComparer<List<string>> StringListComparer() => new(
        (l, r) => l != null && r != null && l.SequenceEqual(r),
        v => v.Aggregate(0, (h, s) => HashCode.Combine(h, s.GetHashCode(StringComparison.Ordinal))),
        v => v.ToList());

    public void Configure(EntityTypeBuilder<Exercise> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.None).ToList())
            .Metadata.SetValueComparer(StringListComparer());

        builder.Property(e => e.SecondaryMuscles)
            .HasConversion(
                v => string.Join(",", v),
                v => string.IsNullOrEmpty(v)
                    ? new List<string>()
                    : v.Split(",", StringSplitOptions.None).ToList())
            .Metadata.SetValueComparer(StringListComparer());

        builder.Property(e => e.Muscles)
            .HasConversion(
                muscles => JsonSerializer.Serialize(muscles, SerializerOptions),
                json => (IReadOnlyList<Muscle>)(JsonSerializer.Deserialize<List<Muscle>>(json, SerializerOptions) ?? new List<Muscle>()))
            .Metadata.SetValueComparer(new ValueComparer<IReadOnlyList<Muscle>>(
                (l, r) => l != null && r != null && l.Count == r.Count && l.Zip(r).All(p => p.First.Name == p.Second.Name),
                v => v.Aggregate(0, (h, m) => HashCode.Combine(h, (m.Name ?? string.Empty).GetHashCode(StringComparison.Ordinal))),
                v => (IReadOnlyList<Muscle>)v.ToList()));

        builder.Property(e => e.Instructions)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, SerializerOptions),
                json => string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<List<string>>(json, SerializerOptions))
            .Metadata.SetValueComparer(new ValueComparer<IReadOnlyList<string>?>(
                (l, r) => l == null && r == null || (l != null && r != null && l.SequenceEqual(r)),
                v => v == null ? 0 : v.Aggregate(0, (h, s) => HashCode.Combine(h, s.GetHashCode(StringComparison.Ordinal))),
                v => v == null ? null : (IReadOnlyList<string>?)v.ToList()));
    }
}
