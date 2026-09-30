using EduManage.Api.Services;
using EduManage.Application.Contracts;
using EduManage.Application.Features.UserProfiles;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public sealed class UsersController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileOut>> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await mediator.Send(new GetUserProfileQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

        return profile is null ? NotFound(new { detail = "Profile not yet created." }) : Ok(profile);
    }

    [HttpPatch("profile")]
    public async Task<ActionResult<UserProfileOut>> UpdateProfile([FromBody] UserProfileUpdate request, CancellationToken cancellationToken)
    {
        var updated = await mediator.Send(new UpdateUserProfileCommand(currentUserService.GetCurrentUserId()!, request), cancellationToken);
        return Ok(updated);
    }
}
