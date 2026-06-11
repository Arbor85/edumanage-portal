using System.Text.Json.Serialization;

namespace ExerciseGenerator.Domain.Models;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string PrimaryMuscle { get; set; } = string.Empty;
    public List<string> SecondaryMuscles { get; set; } = [];
    public List<Muscle> Muscles { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public string ActivityType { get; set; } = string.Empty;
    public string ActivityTrackType { get; set; } = string.Empty;

    [JsonIgnore]
    public int DataCompleteness
    {
        get
        {
            int score = 0;
            if (!string.IsNullOrWhiteSpace(Name)) score++;
            if (!string.IsNullOrWhiteSpace(ShortDescription)) score++;
            if (!string.IsNullOrWhiteSpace(PrimaryMuscle)) score++;
            if (SecondaryMuscles.Count > 0) score++;
            if (Muscles.Count > 0) score++;
            if (Tags.Count > 0) score++;
            if (!string.IsNullOrWhiteSpace(ActivityType)) score++;
            if (!string.IsNullOrWhiteSpace(ActivityTrackType)) score++;
            return score;
        }
    }
}
