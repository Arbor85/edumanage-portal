using EduManage.Api.Services;
using EduManage.Application.Common;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Forms;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/standalone-form-responses")]
[Authorize(Policy = "manage:forms")]
public sealed class StandaloneFormResponsesController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<StandaloneFormResponseOut>> Submit([FromBody] StandaloneFormResponseCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new SubmitStandaloneFormResponseCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
            return Created($"/api/standalone-form-responses/{created.Id}", created);
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

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StandaloneFormResponseOut>>> List([FromQuery(Name = "template_id")] string templateId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListStandaloneFormResponsesQuery(templateId, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteStandaloneFormResponseCommand(id, currentUserService.GetCurrentUserId()!), cancellationToken);
            return NoContent();
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

    [HttpPut("{id}")]
    public async Task<ActionResult<StandaloneFormResponseOut>> Update(string id, [FromBody] StandaloneFormResponseCreate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateStandaloneFormResponseCommand(id, request, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpGet("toon")]
    [Produces("text/plain")]
    public async Task<IActionResult> Toon([FromQuery(Name = "template_id")] string templateId, CancellationToken cancellationToken)
    {
        try
        {
            var template = await mediator.Send(new GetFormTemplateQuery(templateId, currentUserService.GetCurrentUserId()!), cancellationToken);
            var responses = await mediator.Send(new ListStandaloneFormResponsesQuery(templateId, currentUserService.GetCurrentUserId()!), cancellationToken);
            return Content(FormToonSerializer.Serialize(template, responses), "text/plain", System.Text.Encoding.UTF8);
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

    [HttpGet("summary")]
    public async Task<ActionResult<StandaloneFormResponsesSummaryOut>> Summary([FromQuery(Name = "template_id")] string templateId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetStandaloneFormResponsesSummaryQuery(templateId, currentUserService.GetCurrentUserId()!), cancellationToken));
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
}
