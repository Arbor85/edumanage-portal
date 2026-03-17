using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
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
}