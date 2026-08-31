using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.BuildingAvailability;
using EduManage.Application.Features.Buildings;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/buildings")]
public sealed class BuildingsController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BuildingOut>>> ListBuildings(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListBuildingsQuery(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<BuildingOut>> AddBuilding([FromBody] BuildingCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new AddBuildingCommand(currentUserService.GetCurrentUserId()!, request), cancellationToken);
            return Created($"/api/buildings/{created.Id}", created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("{buildingId}")]
    public async Task<ActionResult<BuildingOut>> UpdateBuilding([FromRoute] string buildingId, [FromBody] BuildingUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateBuildingCommand(buildingId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{buildingId}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteBuilding([FromRoute] string buildingId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteBuildingCommand(buildingId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpGet("{buildingId}/availability")]
    public Task<IReadOnlyList<BuildingAvailabilityOut>> ListAvailability([FromRoute] string buildingId, CancellationToken cancellationToken) =>
        mediator.Send(new ListBuildingAvailabilityQuery(buildingId), cancellationToken);

    [HttpPost("{buildingId}/availability")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<BuildingAvailabilityOut>> AddAvailability([FromRoute] string buildingId, [FromBody] BuildingAvailabilityCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddBuildingAvailabilityCommand(buildingId, request), cancellationToken);
        return Created(string.Empty, created);
    }

    [HttpPut("{buildingId}/availability/{availId}")]
    public async Task<ActionResult<BuildingAvailabilityOut>> UpdateAvailability([FromRoute] string availId, [FromBody] BuildingAvailabilityUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateBuildingAvailabilityCommand(availId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{buildingId}/availability/{availId}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteAvailability([FromRoute] string availId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteBuildingAvailabilityCommand(availId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
