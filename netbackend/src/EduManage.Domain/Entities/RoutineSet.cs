namespace EduManage.Domain.Entities;

public class RoutineSet
{
    public int Id { get; set; }
    public int RoutineExerciseId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? Reps { get; set; }
    public double? Weight { get; set; }
    public string? Notes { get; set; }

    public RoutineExercise? RoutineExercise { get; set; }
}
