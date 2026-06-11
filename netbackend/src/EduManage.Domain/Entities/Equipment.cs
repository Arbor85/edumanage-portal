namespace EduManage.Domain.Entities;

public class Equipment
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public EquipmentType EquipmentType { get; set; }
    public List<decimal>? WeightOptions { get; set; }
    public bool IsCore { get; set; }
}
