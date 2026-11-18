namespace EduManage.Domain.Entities;

public class QueuedWorkout
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RoutineId { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}
