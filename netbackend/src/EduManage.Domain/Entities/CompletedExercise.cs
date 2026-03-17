namespace EduManage.Domain.Entities;

public class CompletedExercise
{
    public int Id { get; set; }
    public string WorkoutHistoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsBodyweight { get; set; }

    public WorkoutHistory? WorkoutHistory { get; set; }
    public ICollection<CompletedSet> Sets { get; set; } = [];
}
