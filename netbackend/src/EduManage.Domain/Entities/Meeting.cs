namespace EduManage.Domain.Entities;

public class Meeting
{
    public string Id { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string StartsAt { get; set; } = string.Empty;
    public double Price { get; set; }
    public string? UserId { get; set; }

    public Client? Client { get; set; }
}
