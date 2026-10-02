namespace EduManage.Domain.Entities;

public class UserChallengeLog
{
    public string UserId { get; set; } = default!;
    public DateOnly ChallengeDate { get; set; }
}
