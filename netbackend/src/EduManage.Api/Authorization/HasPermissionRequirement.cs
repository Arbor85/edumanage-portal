using Microsoft.AspNetCore.Authorization;

namespace EduManage.Api.Authorization;

/// <summary>
/// Authorization requirement that checks if a user has a specific permission.
/// </summary>
public sealed class HasPermissionRequirement(string permission) : IAuthorizationRequirement
{
    /// <summary>
    /// Gets the required permission.
    /// </summary>
    public string Permission { get; } = permission;
}
