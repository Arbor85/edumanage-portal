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

        // Seed exercise data
        builder.HasData(
            new Exercise
            {
                Id = 1,
                Name = "Squat",
                ShortDescription = "Back squat pattern",
                PrimaryMuscle = "Quadriceps",
                MusclesJson = "[{\"name\":\"Quadriceps\"}]",
                Tags = ["Legs", "Strength"]
            },
            new Exercise
            {
                Id = 2,
                Name = "Bench Press",
                ShortDescription = "Barbell horizontal press",
                PrimaryMuscle = "Chest",
                MusclesJson = "[{\"name\":\"Pectorals\"}]",
                Tags = ["Chest", "Strength"]
            },
            new Exercise
            {
                Id = 3,
                Name = "Deadlift",
                ShortDescription = "Hip hinge pull",
                PrimaryMuscle = "Posterior Chain",
                MusclesJson = "[{\"name\":\"Hamstrings\"}]",
                Tags = ["Back", "Strength"]
            }
        );
    }
}
