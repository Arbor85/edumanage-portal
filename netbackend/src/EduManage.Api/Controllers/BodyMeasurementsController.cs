using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.BodyMeasurements;
using EduManage.Api.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/body-measurements")]
[Authorize]
public sealed class BodyMeasurementsController(ISender mediator, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BodyMeasurementOut>>> List(CancellationToken cancellationToken)
    {
        var userId = currentUser.GetCurrentUserId();
        if (userId is null) return Unauthorized();
        return Ok(await mediator.Send(new ListBodyMeasurementsQuery(userId), cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<BodyMeasurementOut>> Log([FromBody] BodyMeasurementCreate request, CancellationToken cancellationToken)
    {
        var userId = currentUser.GetCurrentUserId();
        if (userId is null) return Unauthorized();
        var created = await mediator.Send(new LogBodyMeasurementCommand(userId, request), cancellationToken);
        return Created($"/api/body-measurements/{created.Id}", created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken cancellationToken)
    {
        var userId = currentUser.GetCurrentUserId();
        if (userId is null) return Unauthorized();
        try
        {
            await mediator.Send(new DeleteBodyMeasurementCommand(id, userId), cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
