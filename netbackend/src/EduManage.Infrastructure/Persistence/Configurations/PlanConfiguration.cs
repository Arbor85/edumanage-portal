using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.Client)
            .WithMany(c => c.Plans)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.Workouts)
            .HasConversion(
                workouts => JsonSerializer.Serialize(workouts, SerializerOptions),
                json => string.IsNullOrWhiteSpace(json)
                    ? new List<PlanWorkout>()
                    : JsonSerializer.Deserialize<List<PlanWorkout>>(json, SerializerOptions) ?? new List<PlanWorkout>())
            .Metadata.SetValueComparer(new ValueComparer<ICollection<PlanWorkout>>(
                (left, right) => SerializeWorkouts(left) == SerializeWorkouts(right),
                workouts => SerializeWorkouts(workouts).GetHashCode(StringComparison.Ordinal),
                workouts => DeserializeWorkouts(SerializeWorkouts(workouts))));
    }

    private static string SerializeWorkouts(ICollection<PlanWorkout>? workouts)
    {
        var value = workouts ?? new List<PlanWorkout>();
        return JsonSerializer.Serialize(value, SerializerOptions);
    }

    private static ICollection<PlanWorkout> DeserializeWorkouts(string json)
    {
        return JsonSerializer.Deserialize<List<PlanWorkout>>(json, SerializerOptions) ?? new List<PlanWorkout>();
    }
}
