namespace EduManage.Domain.Entities;

public class ScheduleEntry
{
    public string Id { get; set; } = string.Empty;
    public string SchedulePlanId { get; set; } = string.Empty;
    public string TrainerUserId { get; set; } = string.Empty;
    public string BuildingId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }

    // Recurring fields
    public List<string> DaysOfWeek { get; set; } = [];
    public string? ValidFrom { get; set; }
    public string? ValidTo { get; set; }

    // Both recurring and one-off
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;

    // One-off field
    public string? Date { get; set; }

    public bool HasMismatch { get; set; }
    public SchedulePlan Plan { get; set; } = null!;
}
