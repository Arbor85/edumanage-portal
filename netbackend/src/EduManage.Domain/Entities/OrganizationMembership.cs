namespace EduManage.Domain.Entities;

public class OrganizationMembership
{
    public string Id { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string TrainerUserId { get; set; } = string.Empty;
    public string JoinedAt { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Organization Organization { get; set; } = null!;
}
