namespace EduManage.Domain.Entities;

public class PlanWorkout
{
    public string Id { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? UserId { get; set; }
    public string Date { get; set; } = string.Empty;

    public string SupersetGroupsJson { get; set; } = "[]";

    public bool IsMeeting { get; set; }
    public string? MeetingId { get; set; }
    public double? MeetingPrice { get; set; }
    public string? MeetingStartTime { get; set; }

    public Plan? Plan { get; set; }
    public ICollection<RoutineExercise> Exercises { get; set; } = [];
}
