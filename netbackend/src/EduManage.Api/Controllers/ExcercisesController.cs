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
}