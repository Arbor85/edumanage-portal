using EduManage.Application.Services;

namespace EduManage.Api.Services;

internal sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? GetCurrentUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        return user?.Identity?.Name ?? user?.FindFirst("sub")?.Value ?? user?.FindFirst("user_id")?.Value;
    }
}
