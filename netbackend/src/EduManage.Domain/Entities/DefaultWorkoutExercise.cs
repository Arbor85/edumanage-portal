namespace EduManage.Domain.Entities;

public class DefaultWorkoutExercise
{
    public int Id { get; set; }
    public string DefaultWorkoutId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
    public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;

    public DefaultWorkout? DefaultWorkout { get; set; }
    public ICollection<DefaultWorkoutSet> Sets { get; set; } = [];
}
