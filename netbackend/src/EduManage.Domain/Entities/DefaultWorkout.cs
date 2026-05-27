namespace EduManage.Domain.Entities;

public class DefaultWorkout
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public ICollection<DefaultWorkoutExercise> Exercises { get; set; } = [];
}
