using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.ScheduleEntries;

public sealed record ListMyScheduleQuery(string TrainerUserId) : IRequest<IReadOnlyList<ScheduleEntryOut>>
{
    internal sealed class Handler(IScheduleEntryRepository repo) : IRequestHandler<ListMyScheduleQuery, IReadOnlyList<ScheduleEntryOut>>
    {
        public async Task<IReadOnlyList<ScheduleEntryOut>> Handle(ListMyScheduleQuery request, CancellationToken cancellationToken)
        {
            var items = await repo.ListPublishedByTrainerAsync(request.TrainerUserId, cancellationToken);
            return items.Select(ScheduleEntryHelpers.ToOut).ToList();
        }
    }
}
