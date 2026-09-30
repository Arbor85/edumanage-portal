using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Forms;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/form-responses")]
[Authorize]
public sealed class FormResponsesController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FormResponseOut>>> ListFormResponses([FromQuery(Name = "client_id")] string clientId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListFormResponsesQuery(clientId, currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { detail = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<FormResponseOut>> SubmitFormResponse([FromBody] FormResponseCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new SubmitFormResponseCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
            return Created($"/api/form-responses/{created.Id}", created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { detail = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }
}
