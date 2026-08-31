using EduManage.Api.Services;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Organizations;
using EduManage.Application.Features.TrainerAvailability;
using EduManage.Application.Features.TrainerCourseAssociations;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/organizations")]
public sealed class OrganizationsController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<OrganizationOut>> CreateOrganization([FromBody] OrganizationCreate request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()!;
        var created = await mediator.Send(new CreateOrganizationCommand(userId, request), cancellationToken);
        return Created($"/api/organizations/mine", created);
    }

    [HttpGet("mine")]
    public async Task<ActionResult<OrganizationOut>> GetMyOrganization(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GetMyOrganizationQuery(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("invite")]
    public async Task<ActionResult<OrganizationOut>> GenerateInvite(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new GenerateInviteCommand(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpGet("trainers")]
    public async Task<ActionResult<IReadOnlyList<OrganizationMemberOut>>> ListTrainers(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListOrganizationTrainersQuery(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("join/{code}")]
    [AllowAnonymous]
    [Authorize]
    public async Task<ActionResult<OrganizationMemberOut>> JoinOrganization(
        [FromRoute] string code,
        [FromBody] JoinOrganizationRequest? request,
        CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (userId is null) return Unauthorized();
        try
        {
            return Ok(await mediator.Send(new JoinOrganizationCommand(
                userId, code,
                request?.FirstName, request?.LastName,
                request?.InitialAvailabilities), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("trainers/{trainerId}")]
    public async Task<ActionResult<Dictionary<string, string>>> RemoveTrainer([FromRoute] string trainerId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new RemoveTrainerCommand(currentUserService.GetCurrentUserId()!, trainerId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpGet("trainers/{trainerId}/availability")]
    public async Task<ActionResult<IReadOnlyList<AvailabilityOut>>> ListTrainerAvailability([FromRoute] string trainerId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListTrainerAvailabilityQuery(currentUserService.GetCurrentUserId()!, trainerId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("trainers/{trainerId}/availability")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<AvailabilityOut>> AddTrainerAvailability([FromRoute] string trainerId, [FromBody] AvailabilityCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new AddTrainerAvailabilityCommand(currentUserService.GetCurrentUserId()!, trainerId, request), cancellationToken);
            return Created(string.Empty, created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("trainers/{trainerId}/availability/{id}")]
    public async Task<ActionResult<AvailabilityOut>> UpdateTrainerAvailability([FromRoute] string id, [FromBody] AvailabilityUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateTrainerAvailabilityCommand(id, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("trainers/{trainerId}/availability/{id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteTrainerAvailability([FromRoute] string id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteTrainerAvailabilityCommand(id), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpGet("trainer-courses")]
    public async Task<ActionResult<IReadOnlyList<TrainerCourseAssociationOut>>> ListTrainerCourses(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new ListTrainerCourseAssociationsQuery(currentUserService.GetCurrentUserId()!), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost("trainer-courses")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<TrainerCourseAssociationOut>> AddTrainerCourse([FromBody] TrainerCourseAssociationCreate request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mediator.Send(new AddTrainerCourseAssociationCommand(currentUserService.GetCurrentUserId()!, request), cancellationToken);
            return Created(string.Empty, created);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("trainer-courses/{id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteTrainerCourse([FromRoute] string id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteTrainerCourseAssociationCommand(id), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
