using System.Security.Claims;
using System.Text.Encodings.Web;
using EduManage.Application.Contracts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace EduManage.Api.Authentication;

public sealed class ApiKeyAuthenticationHandler(
    IOptionsMonitor<ApiKeyAuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IApiKeyRepository repo)
    : AuthenticationHandler<ApiKeyAuthenticationOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(ApiKeyAuthenticationOptions.HeaderName, out var header) || string.IsNullOrEmpty(header))
        {
            return AuthenticateResult.NoResult();
        }

        var apiKey = await repo.GetByKeyAsync(header.ToString(), Context.RequestAborted);
        if (apiKey is null)
        {
            return AuthenticateResult.Fail("Invalid API key");
        }

        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, apiKey.UserId) },
            ApiKeyAuthenticationOptions.Scheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return AuthenticateResult.Success(ticket);
    }
}
