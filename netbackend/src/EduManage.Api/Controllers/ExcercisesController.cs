using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Excercises;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[ApiController]
[Route("api/excercises")]
public sealed class ExcercisesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ExcerciseOut>> ListExcercises(CancellationToken cancellationToken) =>
        mediator.Send(new ListExcercisesQuery(), cancellationToken);

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<ExcerciseOut>> AddExcercise([FromBody] ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        ValidateTags(request.Tags);
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await mediator.Send(new AddExcerciseCommand(request), cancellationToken);
        return Created($"/api/excercises/{created.Id}", created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ExcerciseOut>> UpdateExcercise([FromRoute] int id, [FromBody] ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        ValidateTags(request.Tags);
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            return Ok(await mediator.Send(new UpdateExcerciseCommand(id, request), cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExcercise([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteExcerciseCommand(id), cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    private void ValidateTags(IReadOnlyList<string>? tags)
    {
        if (tags is null)
        {
            return;
        }

        for (var index = 0; index < tags.Count; index++)
        {
            if (tags[index].Length > 50)
            {
                ModelState.AddModelError($"tags[{index}]", "Each tag must be at most 50 characters.");
            }
        }
    }

}