namespace EduManage.Api.Services;

internal sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? GetCurrentUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        return user.FindFirst("sub")?.Value
            ?? user.Identity?.Name
            ?? user.FindFirst("user_id")?.Value
            ?? user.FindFirst("nameid")?.Value;
    }
}
