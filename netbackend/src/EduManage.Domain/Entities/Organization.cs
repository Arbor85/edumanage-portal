namespace EduManage.Domain.Entities;

public class Organization
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public ICollection<OrganizationMembership> Memberships { get; set; } = [];
}
