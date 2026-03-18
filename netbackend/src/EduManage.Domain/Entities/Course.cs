namespace EduManage.Domain.Entities;

public class Course
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? Size { get; set; }
    public double PriceValue { get; set; }
    public string PriceCurrency { get; set; } = string.Empty;
    public string? Description { get; set; }
}
