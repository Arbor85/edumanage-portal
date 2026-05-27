namespace EduManage.Domain.Entities;

public class CompletedExercise
{
    public int Id { get; set; }
    public string WorkoutHistoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
    public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;

    public WorkoutHistory? WorkoutHistory { get; set; }
    public ICollection<CompletedSet> Sets { get; set; } = [];
}
