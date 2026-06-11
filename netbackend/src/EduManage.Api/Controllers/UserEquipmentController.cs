using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.UserEquipment;

namespace EduManage.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/user-equipment")]
public sealed class UserEquipmentController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<UserEquipmentOut>> GetUserEquipment(CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()!;
        return await mediator.Send(new GetUserEquipmentQuery(userId), cancellationToken);
    }

    [HttpPut]
    public async Task<ActionResult<IReadOnlyList<UserEquipmentOut>>> UpdateUserEquipment(
        [FromBody] UserEquipmentBatchUpdate request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()!;
        try
        {
            return Ok(await mediator.Send(new UpdateUserEquipmentCommand(userId, request), cancellationToken));
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
