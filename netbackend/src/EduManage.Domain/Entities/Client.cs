namespace EduManage.Domain.Entities;

public record Client
{
    public Client(
        string invitationCode,
        string name,
        string trainerUserId,
        IEnumerable<string> tags)
    {
        InvitationCode = invitationCode;
        Name = name;
        TrainerUserId = trainerUserId;
        Tags = [.. tags];
        Status = "Invited";
    }

    private Client()
    {
    }

    public List<string> Tags { get; private set; } = [];

    public string ImageUrl { get; private set; } = string.Empty;

    public string Status { get; private set; } = string.Empty;

    public string? UserId { get; private set; } = null;

    public ICollection<Plan> Plans { get; init; } = [];

    public ICollection<Meeting> Meetings { get; init; } = [];

    public string InvitationCode { get; }

    public string Name { get; private set; }

    public string TrainerUserId { get; }

    public void AcceptInvitation(string clientUserId, string imageUrl)
    {
        UserId = clientUserId;
        ImageUrl = imageUrl;
        Status = "Active";
    }

    public void Update(string name, IEnumerable<string> tags)
    {
        Name = name;
        Tags = [.. tags];
    }
}
