namespace EduManage.Domain.Entities;

public class PlanWorkout
{
    public string Id { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? UserId { get; set; }
    public string Date { get; set; } = string.Empty;

    public Plan? Plan { get; set; }
    public ICollection<RoutineExercise> Exercises { get; set; } = [];
}
