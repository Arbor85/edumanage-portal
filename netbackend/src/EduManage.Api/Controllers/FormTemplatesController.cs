using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Forms;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/form-templates")]
[Authorize]
public sealed class FormTemplatesController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<FormTemplateOut>> ListFormTemplates(CancellationToken cancellationToken) =>
        mediator.Send(new ListFormTemplatesQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

    [HttpGet("{form_template_id}")]
    public async Task<ActionResult<FormTemplateOut>> GetFormTemplate([FromRoute(Name = "form_template_id")] string formTemplateId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetFormTemplateQuery(formTemplateId, currentUserService.GetCurrentUserId()!), cancellationToken));
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
    public async Task<ActionResult<FormTemplateOut>> CreateFormTemplate([FromBody] FormTemplateCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new CreateFormTemplateCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
        return Created($"/api/form-templates/{created.Id}", created);
    }

    [HttpPut("{form_template_id}")]
    public async Task<ActionResult<FormTemplateOut>> UpdateFormTemplate([FromRoute(Name = "form_template_id")] string formTemplateId, [FromBody] FormTemplateUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateFormTemplateCommand(formTemplateId, request, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpDelete("{form_template_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeactivateFormTemplate([FromRoute(Name = "form_template_id")] string formTemplateId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeactivateFormTemplateCommand(formTemplateId, currentUserService.GetCurrentUserId()!), cancellationToken));
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
