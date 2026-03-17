namespace EduManage.Domain.Entities;

public class Client
{
    public string InvitationCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
    public string ImageUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? UserId { get; set; }

    public ICollection<Plan> Plans { get; set; } = [];
    public ICollection<Meeting> Meetings { get; set; } = [];
}
