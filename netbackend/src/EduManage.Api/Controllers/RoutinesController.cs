using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Routines;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/routines")]
public sealed class RoutinesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<RoutineOut>> ListRoutines(CancellationToken cancellationToken) =>
        mediator.Send(new ListRoutinesQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<RoutineOut>> AddRoutine([FromBody] RoutineCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddRoutineCommand(request), cancellationToken);
        return Created($"/api/routines/{created.Id}", created);
    }

    [HttpPut("{routine_id}")]
    public async Task<ActionResult<RoutineOut>> UpdateRoutine([FromRoute(Name = "routine_id")] string routineId, [FromBody] RoutineUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateRoutineCommand(routineId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{routine_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteRoutine([FromRoute(Name = "routine_id")] string routineId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteRoutineCommand(routineId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("complete")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<WorkoutHistoryOut>> CompleteRoutine([FromBody] CompleteRoutineCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new CompleteRoutineCommand(request), cancellationToken);
        return StatusCode(StatusCodes.Status201Created, created);
    }
}