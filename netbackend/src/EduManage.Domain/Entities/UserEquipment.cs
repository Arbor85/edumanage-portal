namespace EduManage.Domain.Entities;

public class UserEquipment
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = default!;
    public List<decimal>? AvailableWeights { get; set; }
}
