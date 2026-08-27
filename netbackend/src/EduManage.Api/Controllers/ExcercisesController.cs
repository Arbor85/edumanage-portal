using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Excercises;
using EduManage.Api.Services;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/excercises")]
public sealed class ExcercisesController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ExcerciseOut>> ListExcercises(CancellationToken cancellationToken) =>
        mediator.Send(new ListExcercisesQuery(currentUserService.GetCurrentUserId()), cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ExcerciseOut>> GetExcercise([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetExcerciseQuery(id), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<ExcerciseOut>> AddExcercise([FromBody] ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddExcerciseCommand(request), cancellationToken);
        return Created($"/api/excercises/{created.Id}", created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ExcerciseOut>> UpdateExcercise([FromRoute] int id, [FromBody] ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateExcerciseCommand(id, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExcercise([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteExcerciseCommand(id), cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{id:int}/favourite")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ToggleFavourite([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new ToggleExcerciseFavouriteCommand(id, currentUserService.GetCurrentUserId()!), cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
