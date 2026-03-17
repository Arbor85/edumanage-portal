using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Plans;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/plans")]
public sealed class PlansController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<PlanOut>> ListPlans(CancellationToken cancellationToken) =>
        mediator.Send(new ListPlansQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<PlanOut>> AddPlan([FromBody] PlanCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddPlanCommand(request), cancellationToken);
        return Created($"/api/plans/{created.Id}", created);
    }

    [HttpGet("{plan_id}")]
    public async Task<ActionResult<PlanOut>> GetPlan([FromRoute(Name = "plan_id")] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetPlanQuery(planId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("{plan_id}")]
    public async Task<ActionResult<PlanOut>> UpdatePlan([FromRoute(Name = "plan_id")] string planId, [FromBody] PlanUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdatePlanCommand(planId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{plan_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeletePlan([FromRoute(Name = "plan_id")] string planId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeletePlanCommand(planId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPatch("{plan_id}/status")]
    public async Task<ActionResult<PlanOut>> UpdatePlanStatus([FromRoute(Name = "plan_id")] string planId, [FromBody] PlanStatusUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdatePlanStatusCommand(planId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}