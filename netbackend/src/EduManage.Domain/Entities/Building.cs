namespace EduManage.Domain.Entities;

public class Building
{
    public string Id { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public ICollection<BuildingAvailability> Availabilities { get; set; } = [];
}
