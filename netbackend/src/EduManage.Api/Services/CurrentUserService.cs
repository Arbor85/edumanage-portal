using System.Text;
using System.Text.Json;
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

        var tokenParts = token.Split('.');
        if (tokenParts.Length < 2)
        {
            return null;
        }

        try
        {
            var payloadBytes = DecodeBase64Url(tokenParts[1]);
            using var payload = JsonDocument.Parse(payloadBytes);
            var root = payload.RootElement;

            if (TryGetClaimValue(root, "sub", out var subject))
            {
                return subject;
            }

            if (TryGetClaimValue(root, "user_id", out var userId))
            {
                return userId;
            }

            if (TryGetClaimValue(root, "nameid", out var nameId))
            {
                return nameId;
            }

            return null;
        }
        catch (JsonException)
        {
            return null;
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private static bool TryGetClaimValue(JsonElement payload, string claimName, out string? claimValue)
    {
        if (payload.TryGetProperty(claimName, out var propertyValue) && propertyValue.ValueKind == JsonValueKind.String)
        {
            claimValue = propertyValue.GetString();
            return !string.IsNullOrWhiteSpace(claimValue);
        }

        claimValue = null;
        return false;
    }

    private static byte[] DecodeBase64Url(string input)
    {
        var base64 = input.Replace('-', '+').Replace('_', '/');
        var padding = 4 - (base64.Length % 4);
        if (padding is > 0 and < 4)
        {
            base64 = base64.PadRight(base64.Length + padding, '=');
        }

        return Convert.FromBase64String(base64);
    }
}
