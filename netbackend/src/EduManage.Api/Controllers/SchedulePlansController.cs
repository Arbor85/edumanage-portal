using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.AutoSchedule;
using EduManage.Application.Features.ScheduleEntries;
using EduManage.Application.Features.SchedulePlans;

namespace EduManage.Api.Controllers;

[ApiController]
[Authorize(Policy = "manage:organization")]
[Route("api/schedule-plans")]
public sealed class SchedulePlansController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SchedulePlanOut>>> ListPlans(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListSchedulePlansQuery(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<SchedulePlanOut>> AddPlan([FromBody] SchedulePlanCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new AddSchedulePlanCommand(currentUserService.GetCurrentUserId()!, request), cancellationToken);
            return Created($"/api/schedule-plans/{created.Id}", created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("{planId}")]
    public async Task<ActionResult<SchedulePlanOut>> UpdatePlan([FromRoute] string planId, [FromBody] SchedulePlanUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateSchedulePlanCommand(planId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{planId}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeletePlan([FromRoute] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteSchedulePlanCommand(planId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{planId}/publish")]
    public async Task<ActionResult<SchedulePlanOut>> Publish([FromRoute] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new PublishSchedulePlanCommand(planId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{planId}/unpublish")]
    public async Task<ActionResult<SchedulePlanOut>> Unpublish([FromRoute] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UnpublishSchedulePlanCommand(planId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpGet("{planId}/entries")]
    public Task<IReadOnlyList<ScheduleEntryOut>> ListEntries([FromRoute] string planId, CancellationToken cancellationToken) =>
        mediator.Send(new ListScheduleEntriesQuery(planId), cancellationToken);

    [HttpPost("{planId}/entries")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<ScheduleEntryOut>> AddEntry([FromRoute] string planId, [FromBody] ScheduleEntryCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var org = await GetOrgId(cancellationToken);
            var created = await mediator.Send(new AddScheduleEntryCommand(planId, org, request), cancellationToken);
            return Created(string.Empty, created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("{planId}/entries/{entryId}")]
    public async Task<ActionResult<ScheduleEntryOut>> UpdateEntry([FromRoute] string entryId, [FromBody] ScheduleEntryUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            var org = await GetOrgId(cancellationToken);
            return Ok(await mediator.Send(new UpdateScheduleEntryCommand(entryId, org, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{planId}/entries/{entryId}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteEntry([FromRoute] string entryId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteScheduleEntryCommand(entryId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{planId}/auto-schedule")]
    public async Task<ActionResult<AutoScheduleResult>> AutoSchedule([FromRoute] string planId, [FromBody] AutoScheduleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new AutoScheduleCommand(currentUserService.GetCurrentUserId()!, planId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("{planId}/auto-schedule/confirm")]
    public async Task<ActionResult<IReadOnlyList<ScheduleEntryOut>>> ConfirmAutoSchedule([FromRoute] string planId, [FromBody] ConfirmAutoScheduleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var org = await GetOrgId(cancellationToken);
            return Ok(await mediator.Send(new ConfirmAutoScheduleCommand(planId, org, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    private async Task<string> GetOrgId(CancellationToken cancellationToken)
    {
        var orgResult = await mediator.Send(new EduManage.Application.Features.Organizations.GetMyOrganizationQuery(currentUserService.GetCurrentUserId()!), cancellationToken);
        return orgResult.Id;
    }
}
