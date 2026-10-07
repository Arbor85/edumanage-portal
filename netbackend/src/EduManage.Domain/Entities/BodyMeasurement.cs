namespace EduManage.Domain.Entities;

public class BodyMeasurement
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public float? WeightKg { get; set; }
    public float? WaistCm { get; set; }
    public float? ThighCm { get; set; }
    public float? BicepCm { get; set; }
    public float? ChestCm { get; set; }
    public float? ButtCm { get; set; }
    public int? SystolicMmHg { get; set; }
    public int? DiastolicMmHg { get; set; }
}
