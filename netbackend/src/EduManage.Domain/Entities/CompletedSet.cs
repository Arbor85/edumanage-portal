namespace EduManage.Domain.Entities;

public class CompletedSet
{
    public int Id { get; set; }
    public int CompletedExerciseId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? Reps { get; set; }
    public double? Weight { get; set; }
    public string? Notes { get; set; }
    public bool Completed { get; set; }

    public CompletedExercise? CompletedExercise { get; set; }
}
