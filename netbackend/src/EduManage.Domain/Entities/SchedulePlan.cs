namespace EduManage.Domain.Entities;

public class SchedulePlan
{
    public string Id { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public string CreatedAt { get; set; } = string.Empty;
    public ICollection<ScheduleEntry> Entries { get; set; } = [];
}
