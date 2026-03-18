namespace EduManage.Domain.Entities;

public class WorkoutHistory
{
    public string Id { get; set; } = string.Empty;
    public string CurrentUserId { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string CompletedAt { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public int TotalSets { get; set; }
    public int CompletedSets { get; set; }

    public ICollection<CompletedExercise> Exercises { get; set; } = [];
    public SourceWorkout? SourceWorkout { get; set; }
}
