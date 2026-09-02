using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.ApiKeys;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/mcp-keys")]
[Authorize]
public sealed class ApiKeysController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ApiKeyOut>> ListApiKeys(CancellationToken cancellationToken) =>
        mediator.Send(new ListApiKeysQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiKeyCreatedOut>> AddApiKey([FromBody] ApiKeyCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddApiKeyCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
        return Created($"/api/mcp-keys/{created.Id}", created);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteApiKey([FromRoute] string id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteApiKeyCommand(id, currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
