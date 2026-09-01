using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.CourseAvailability;
using EduManage.Application.Features.Courses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/courses")]
public sealed class CoursesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<CourseOut>> ListCourses(CancellationToken cancellationToken) =>
        mediator.Send(new ListCoursesQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<CourseOut>> AddCourse([FromBody] CourseCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddCourseCommand(request), cancellationToken);
        return Created($"/api/courses/{created.Id}", created);
    }

    [HttpPut("{course_id}")]
    public async Task<ActionResult<CourseOut>> UpdateCourse([FromRoute(Name = "course_id")] string courseId, [FromBody] CourseUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateCourseCommand(courseId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{course_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteCourse([FromRoute(Name = "course_id")] string courseId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteCourseCommand(courseId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    // ── Availability ──────────────────────────────────────────────────────────

    [HttpGet("{course_id}/availability")]
    public Task<IReadOnlyList<CourseAvailabilityOut>> ListAvailability([FromRoute(Name = "course_id")] string courseId, CancellationToken cancellationToken) =>
        mediator.Send(new ListCourseAvailabilityQuery(courseId), cancellationToken);

    [HttpPost("{course_id}/availability")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<CourseAvailabilityOut>> AddAvailability([FromRoute(Name = "course_id")] string courseId, [FromBody] CourseAvailabilityCreate request, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(new AddCourseAvailabilityCommand(courseId, request), cancellationToken);
        return Created($"/api/courses/{courseId}/availability/{created.Id}", created);
    }

    [HttpPut("{course_id}/availability/{avail_id}")]
    public async Task<ActionResult<CourseAvailabilityOut>> UpdateAvailability([FromRoute(Name = "course_id")] string courseId, [FromRoute(Name = "avail_id")] string availId, [FromBody] CourseAvailabilityUpdate request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new UpdateCourseAvailabilityCommand(availId, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{course_id}/availability/{avail_id}")]
    public async Task<ActionResult<Dictionary<string, string>>> DeleteAvailability([FromRoute(Name = "course_id")] string courseId, [FromRoute(Name = "avail_id")] string availId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediator.Send(new DeleteCourseAvailabilityCommand(availId), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
