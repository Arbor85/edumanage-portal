using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Clients;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/clients")]
public sealed class ClientsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ClientOut>> ListClients(CancellationToken cancellationToken) =>
        mediator.Send(new ListClientsQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<ClientOut>> AddClient([FromBody] ClientCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddClientCommand(request), cancellationToken);
        return Created($"/api/clients/{created.InvitationCode}", created);
    }

    [HttpPut("{invitation_code}")]
    public async Task<ActionResult<ClientOut>> EditClient([FromRoute(Name = "invitation_code")] string invitationCode, [FromBody] ClientUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new EditClientCommand(invitationCode, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{invitation_code}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteClient([FromRoute(Name = "invitation_code")] string invitationCode, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteClientCommand(invitationCode), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{invitation_code}/accept")]
    public async Task<ActionResult<ClientOut>> AcceptClientInvitation([FromRoute(Name = "invitation_code")] string invitationCode, [FromBody] AcceptClientInvitationRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new AcceptClientInvitationCommand(invitationCode, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}