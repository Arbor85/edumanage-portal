using EduManage.Api.Services;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Challenges;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/challenges")]
[Authorize]
public sealed class ChallengesController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet("today")]
    public async Task<ActionResult<DailyChallengeOut>> GetToday(CancellationToken cancellationToken) =>
        Ok(await mediator.Send(new GetTodaysChallengeQuery(currentUserService.GetCurrentUserId()!), cancellationToken));

    [HttpPost("log")]
    public async Task<IActionResult> Log([FromBody] LogChallengeRequest _, CancellationToken cancellationToken)
    {
        await mediator.Send(new LogChallengeCommand(currentUserService.GetCurrentUserId()!), cancellationToken);
        return Ok();
    }
}
