using EduManage.Api.Services;
using EduManage.Application.Contracts;
using EduManage.Application.Features.WorkoutQueue;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/workouts/queue")]
[Authorize]
public sealed class WorkoutQueueController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<QueuedWorkoutOut>> List(CancellationToken cancellationToken) =>
        mediator.Send(new ListQueuedWorkoutsQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<QueuedWorkoutOut>> Add([FromBody] QueuedWorkoutCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddQueuedWorkoutCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
        return Created($"/api/workouts/queue/{created.Id}", created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteQueuedWorkoutCommand(id, currentUserService.GetCurrentUserId()!), cancellationToken);
        return deleted ? NoContent() : NotFound(new { detail = $"Queued workout '{id}' was not found." });
    }
}
