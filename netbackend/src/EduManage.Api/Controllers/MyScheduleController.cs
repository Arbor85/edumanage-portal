using EduManage.Api.Services;
using EduManage.Application.Contracts;
using EduManage.Application.Features.ScheduleEntries;

namespace EduManage.Api.Controllers;

[ApiController]
[Authorize(Policy = "view:schedule")]
[Route("api/my-schedule")]
public sealed class MyScheduleController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ScheduleEntryOut>> GetMySchedule(CancellationToken cancellationToken) =>
        mediator.Send(new ListMyScheduleQuery(currentUserService.GetCurrentUserId()!), cancellationToken);
}
