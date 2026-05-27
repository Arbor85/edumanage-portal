namespace EduManage.Domain.Entities;

public class DefaultWorkoutSet
{
    public int Id { get; set; }
    public int DefaultWorkoutExerciseId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? Reps { get; set; }
    public double? Weight { get; set; }
    public string? Notes { get; set; }

    public DefaultWorkoutExercise? DefaultWorkoutExercise { get; set; }
}
