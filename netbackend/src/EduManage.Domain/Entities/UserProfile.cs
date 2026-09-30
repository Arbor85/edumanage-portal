namespace EduManage.Domain.Entities;

public class UserProfile
{
    public string UserId { get; set; } = default!;
    public List<string> Equipment { get; set; } = [];
}
