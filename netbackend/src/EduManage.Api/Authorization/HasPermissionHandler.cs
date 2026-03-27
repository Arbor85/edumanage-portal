using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace EduManage.Api.Authorization;

/// <summary>
/// Authorization handler that validates if the user has the required permission.
/// Checks the "permissions" claim in the JWT token from Auth0.
/// </summary>
public sealed class HasPermissionHandler : AuthorizationHandler<HasPermissionRequirement>
{
    /// <inheritdoc />
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasPermissionRequirement requirement)
    {
        var permissionsClaim = context.User.FindFirst("permissions");

        if (permissionsClaim is null)
        {
            return Task.CompletedTask;
        }

        var permissions = permissionsClaim.Value.Split(' ');

        if (permissions.Contains(requirement.Permission))
        {
            context.Succeed(requirement);
        }
        // menage:clients
        // manage:clients
        return Task.CompletedTask;
    }
}
