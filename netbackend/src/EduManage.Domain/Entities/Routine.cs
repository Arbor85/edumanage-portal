namespace EduManage.Domain.Entities;

public class Routine
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? UserId { get; set; }

    public ICollection<RoutineExercise> Exercises { get; set; } = [];
}
