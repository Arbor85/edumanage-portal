namespace EduManage.Domain.Entities;

public class Course
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? Size { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Description { get; set; }
    public ICollection<CourseAvailability> Availabilities { get; set; } = [];
}
