namespace EduManage.Domain.Entities;

public class RoutineExercise
{
    public int Id { get; set; }
    public string RoutineId { get; set; } = string.Empty;
    public string? PlanWorkoutId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsBodyweight { get; set; }

    public Routine? Routine { get; set; }
    public ICollection<RoutineSet> Sets { get; set; } = [];
}
