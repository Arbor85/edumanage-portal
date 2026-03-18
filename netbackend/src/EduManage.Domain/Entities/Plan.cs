namespace EduManage.Domain.Entities;

public class Plan
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;

    public Client? Client { get; set; }
    public ICollection<PlanWorkout> Workouts { get; set; } = [];
}
