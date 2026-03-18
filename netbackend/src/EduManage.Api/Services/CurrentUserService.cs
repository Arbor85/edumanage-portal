using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;

namespace EduManage.Api.Services;

internal sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? GetCurrentUserId()
    {
        if (httpContextAccessor.HttpContext?.Request.Headers.TryGetValue("Authorization", out StringValues authorizationHeader) != true)
        {
            return null;
        }

        var bearerToken = authorizationHeader.ToString();
        if (!bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var token = bearerToken["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
        {
            return null;
        }

        var jwtToken = tokenHandler.ReadJwtToken(token);
        return jwtToken.Claims.FirstOrDefault(claim => claim.Type is "sub" or "user_id" or "nameid")?.Value;
    }
}
