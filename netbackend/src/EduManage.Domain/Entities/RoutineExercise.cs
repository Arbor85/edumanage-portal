namespace EduManage.Domain.Entities;

public class RoutineExercise
{
    public int Id { get; set; }
    public string RoutineId { get; set; } = string.Empty;
    public string? PlanWorkoutId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
    public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;

    public Routine? Routine { get; set; }
    public ICollection<RoutineSet> Sets { get; set; } = [];
}
