using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.ScheduleEntries;

public sealed record ListScheduleEntriesQuery(string PlanId) : IRequest<IReadOnlyList<ScheduleEntryOut>>
{
    internal sealed class Handler(IScheduleEntryRepository repo) : IRequestHandler<ListScheduleEntriesQuery, IReadOnlyList<ScheduleEntryOut>>
    {
        public async Task<IReadOnlyList<ScheduleEntryOut>> Handle(ListScheduleEntriesQuery request, CancellationToken cancellationToken)
        {
            var items = await repo.ListByPlanAsync(request.PlanId, cancellationToken);
            return items.Select(ScheduleEntryHelpers.ToOut).ToList();
        }
    }
}
