using System.Text.Json.Nodes;
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

        // Configure Muscles property: stored as JSON string in database, converted automatically by EF
        builder.Property(e => e.Muscles)
            .HasConversion(
                muscles => muscles.Any() ? "[" + string.Join(",", muscles.Select(m => m.ToJsonString())) + "]" : "[]",
                json => ParseJsonObjects(json));

        // Seed exercise data
        builder.HasData(
            new Exercise
            {
                Id = 1,
                Name = "Squat",
                ShortDescription = "Back squat pattern",
                PrimaryMuscle = "Quadriceps",
                Muscles = new List<JsonObject> { JsonNode.Parse("{\"name\":\"Quadriceps\"}")!.AsObject() }.AsReadOnly(),
                Tags = ["Legs", "Strength"]
            },
            new Exercise
            {
                Id = 2,
                Name = "Bench Press",
                ShortDescription = "Barbell horizontal press",
                PrimaryMuscle = "Chest",
                Muscles = new List<JsonObject> { JsonNode.Parse("{\"name\":\"Pectorals\"}")!.AsObject() }.AsReadOnly(),
                Tags = ["Chest", "Strength"]
            },
            new Exercise
            {
                Id = 3,
                Name = "Deadlift",
                ShortDescription = "Hip hinge pull",
                PrimaryMuscle = "Posterior Chain",
                Muscles = new List<JsonObject> { JsonNode.Parse("{\"name\":\"Hamstrings\"}")!.AsObject() }.AsReadOnly(),
                Tags = ["Back", "Strength"]
            }
        );
    }

    private static IReadOnlyList<JsonObject> ParseJsonObjects(string json)
    {
        try
        {
            var parsed = JsonNode.Parse(json);
            if (parsed is JsonArray arr)
            {
                return arr.OfType<JsonObject>().ToList().AsReadOnly();
            }
        }
        catch { }

        return [];
    }
}
