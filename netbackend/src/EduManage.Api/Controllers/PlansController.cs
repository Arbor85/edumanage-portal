using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Plans;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/plans")]
[Authorize]
public sealed class PlansController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<PlanOut>> ListPlans(CancellationToken cancellationToken) =>
        mediator.Send(new ListPlansQuery(currentUserService.GetCurrentUserId()!), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<PlanOut>> AddPlan([FromBody] PlanCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new AddPlanCommand(request, currentUserService.GetCurrentUserId()!), cancellationToken);
            return Created($"/api/plans/{created.Id}", created);
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

    [HttpGet("{plan_id}")]
    public async Task<ActionResult<PlanOut>> GetPlan([FromRoute(Name = "plan_id")] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetPlanQuery(planId, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpPut("{plan_id}")]
    public async Task<ActionResult<PlanOut>> UpdatePlan([FromRoute(Name = "plan_id")] string planId, [FromBody] PlanUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdatePlanCommand(planId, request, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpDelete("{plan_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeletePlan([FromRoute(Name = "plan_id")] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeletePlanCommand(planId, currentUserService.GetCurrentUserId()!), cancellationToken));
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

    [HttpPatch("{plan_id}/status")]
    public async Task<ActionResult<PlanOut>> UpdatePlanStatus([FromRoute(Name = "plan_id")] string planId, [FromBody] PlanStatusUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdatePlanStatusCommand(planId, request, currentUserService.GetCurrentUserId()!), cancellationToken));
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