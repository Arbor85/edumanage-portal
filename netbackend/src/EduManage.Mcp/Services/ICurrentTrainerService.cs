namespace EduManage.Mcp.Services;

public interface ICurrentTrainerService
{
    string UserId { get; }
}

public sealed class CurrentTrainerService : ICurrentTrainerService
{
    public string UserId { get; set; } = string.Empty;
}
