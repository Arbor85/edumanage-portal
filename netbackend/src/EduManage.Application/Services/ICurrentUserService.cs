namespace EduManage.Application.Services;

/// <summary>
/// Provides access to the current user information from the HTTP context.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user identifier.
    /// </summary>
    /// <returns>The current user ID or null if no user is authenticated.</returns>
    string? GetCurrentUserId();
}
