using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Equipment;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/equipment")]
public sealed class EquipmentController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<EquipmentOut>> ListEquipment(CancellationToken cancellationToken) =>
        mediator.Send(new ListEquipmentQuery(), cancellationToken);

    [HttpPost]
    [Authorize(Policy = "manage:equipment")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<EquipmentOut>> AddEquipment([FromBody] EquipmentWriteRequest request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddEquipmentCommand(request), cancellationToken);
        return Created($"/api/equipment/{created.Id}", created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "manage:equipment")]
    public async Task<ActionResult<EquipmentOut>> UpdateEquipment([FromRoute] Guid id, [FromBody] EquipmentWriteRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateEquipmentCommand(id, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "manage:equipment")]
    public async Task<IActionResult> DeleteEquipment([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteEquipmentCommand(id), cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }
}
