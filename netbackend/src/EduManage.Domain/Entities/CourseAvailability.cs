namespace EduManage.Domain.Entities;

public class CourseAvailability
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public List<string> DaysOfWeek { get; set; } = [];
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? ValidFrom { get; set; }
    public string? ValidTo { get; set; }
    public Course Course { get; set; } = null!;
}
