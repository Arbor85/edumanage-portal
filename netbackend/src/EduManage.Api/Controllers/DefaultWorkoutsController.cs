using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.DefaultWorkouts;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/default-workouts")]
public sealed class DefaultWorkoutsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<DefaultWorkoutOut>> ListDefaultWorkouts(CancellationToken cancellationToken) =>
        mediator.Send(new ListDefaultWorkoutsQuery(), cancellationToken);

    [HttpGet("{id}")]
    public async Task<ActionResult<DefaultWorkoutOut>> GetDefaultWorkout([FromRoute] string id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetDefaultWorkoutQuery(id), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
