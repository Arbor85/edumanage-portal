namespace EduManage.Domain.Entities;

public class ScheduleEntry
{
    public string Id { get; set; } = string.Empty;
    public string SchedulePlanId { get; set; } = string.Empty;
    public string TrainerUserId { get; set; } = string.Empty;
    public string BuildingId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string RecurrenceType { get; set; } = "none";
    public int? RecurrenceInterval { get; set; }
    public string? ValidUntil { get; set; }
    public bool HasMismatch { get; set; }
    public SchedulePlan Plan { get; set; } = null!;
}
