namespace EduManage.Domain.Entities;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string PrimaryMuscle { get; set; } = string.Empty;
    public List<string> SecondaryMuscles { get; set; } = [];

    public IReadOnlyList<Muscle> Muscles { get; set; } = [];

    public List<string> Tags { get; set; } = [];
    public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
    public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;

    public List<string>? Instructions { get; set; }
    public string? Equipment { get; set; }
    public string? Level { get; set; }
    public string? Force { get; set; }
    public string? Mechanic { get; set; }
    public string? Category { get; set; }
    public string? ImagePath { get; set; }
    public string? GifPath { get; set; }
    public string? DatasetId { get; set; }
}
