namespace EduManage.Domain.Entities;

public record Client
{
    public Client(
        string invitationCode,
        string name,
        string trainerUserId)
    {
        InvitationCode = invitationCode;
        Name = name;
        TrainerUserId = trainerUserId;
        Status = "Invited";
    }

    private Client()
    {
    }

    public List<string> Tags { get; init; } = [];

    public string ImageUrl { get; init; } = string.Empty;

    public string Status { get; private set; } = string.Empty;

    public string? UserId { get; private set; } = null;

    public ICollection<Plan> Plans { get; init; } = [];

    public ICollection<Meeting> Meetings { get; init; } = [];

    public string InvitationCode { get; }

    public string Name { get; init; }

    public string TrainerUserId { get; }

    public void AcceptInvitation(string clientUserId)
    {
        UserId = clientUserId;
        Status = "Active";
    }
}
