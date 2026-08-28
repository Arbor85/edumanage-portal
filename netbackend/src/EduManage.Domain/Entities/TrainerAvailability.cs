namespace EduManage.Domain.Entities;

public class TrainerAvailability
{
    public string Id { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string TrainerUserId { get; set; } = string.Empty;
    public List<string> DaysOfWeek { get; set; } = [];
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string ValidFrom { get; set; } = string.Empty;
    public string ValidTo { get; set; } = string.Empty;
}
