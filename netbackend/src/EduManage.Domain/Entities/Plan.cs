namespace EduManage.Domain.Entities;

public class Plan
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? Notes { get; set; }
    public required string Status { get; set; }
    public string? ClientId { get; set; }
    public required string UserId { get; set; }
    public Client? Client { get; set; }
    public ICollection<PlanWorkout> Workouts { get; set; } = [];
}
