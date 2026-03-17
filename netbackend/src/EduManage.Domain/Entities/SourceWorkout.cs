namespace EduManage.Domain.Entities;

public class SourceWorkout
{
    public int Id { get; set; }
    public string WorkoutHistoryId { get; set; } = string.Empty;
    public string WorkoutId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;

    public WorkoutHistory? WorkoutHistory { get; set; }
}
