namespace EduManage.Domain.Entities;

public class BuildingAvailability
{
    public string Id { get; set; } = string.Empty;
    public string BuildingId { get; set; } = string.Empty;
    public List<string> DaysOfWeek { get; set; } = [];
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string ValidFrom { get; set; } = string.Empty;
    public string ValidTo { get; set; } = string.Empty;
    public Building Building { get; set; } = null!;
}
