using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Meetings;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/meetings")]
public sealed class MeetingsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<MeetingOut>> ListMeetings(CancellationToken cancellationToken) =>
        mediator.Send(new ListMeetingsQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<MeetingOut>> AddMeeting([FromBody] MeetingCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddMeetingCommand(request), cancellationToken);
        return Created($"/api/meetings/{created.Id}", created);
    }

    [HttpPut("{meeting_id}")]
    public async Task<ActionResult<MeetingOut>> UpdateMeeting([FromRoute(Name = "meeting_id")] string meetingId, [FromBody] MeetingUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateMeetingCommand(meetingId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{meeting_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteMeeting([FromRoute(Name = "meeting_id")] string meetingId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteMeetingCommand(meetingId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}