using EduManage.Application.Contracts;
using EduManage.Application.Features.GymProfile;
using EduManage.Api.Services;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/gym-profile")]
[Authorize]
public sealed class GymProfileController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<UserExerciseMaxOut>> GetGymProfile(CancellationToken cancellationToken) =>
        mediator.Send(new GetGymProfileQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

    [HttpPut("{exerciseId:int}")]
    public Task<UserExerciseMaxOut> UpsertMax(
        [FromRoute] int exerciseId,
        [FromBody] UserExerciseMaxUpsert request,
        CancellationToken cancellationToken) =>
        mediator.Send(new UpsertUserExerciseMaxCommand(currentUserService.GetCurrentUserId()!, exerciseId, request), cancellationToken);

    [HttpDelete("{exerciseId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteMax([FromRoute] int exerciseId, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteUserExerciseMaxCommand(currentUserService.GetCurrentUserId()!, exerciseId), cancellationToken);
        return NoContent();
    }

    [HttpGet("client/{userId}")]
    public Task<IReadOnlyList<UserExerciseMaxOut>> GetClientGymProfile(
        [FromRoute] string userId,
        CancellationToken cancellationToken) =>
        mediator.Send(new GetClientGymProfileQuery(userId), cancellationToken);
}
