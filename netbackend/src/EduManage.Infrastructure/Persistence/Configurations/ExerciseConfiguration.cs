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

        builder.HasData(
            new Exercise
            {
                Id = 1,
                Name = "Squat",
                ShortDescription = "Back squat pattern",
                PrimaryMuscle = "Quadriceps",
                SecondaryMuscles = ["Glutes", "Hamstrings"],
                Muscles = [new Muscle("Quadriceps")],
                Tags = ["Legs", "Strength"]
            },
            new Exercise
            {
                Id = 2,
                Name = "Bench Press",
                ShortDescription = "Barbell horizontal press",
                PrimaryMuscle = "Chest",
                SecondaryMuscles = ["Front Deltoids", "Triceps"],
                Muscles = [new Muscle("Pectorals")],
                Tags = ["Chest", "Strength"]
            },
            new Exercise
            {
                Id = 3,
                Name = "Deadlift",
                ShortDescription = "Hip hinge pull",
                PrimaryMuscle = "Posterior Chain",
                SecondaryMuscles = ["Glutes", "Lower Back"],
                Muscles = [new Muscle("Hamstrings")],
                Tags = ["Back", "Strength"]
            }
        );
    }
}
