using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.WorkoutQueue;

public sealed record ListQueuedWorkoutsQuery(string CurrentUserId) : IRequest<IReadOnlyList<QueuedWorkoutOut>>
{
    internal sealed class Handler(IQueuedWorkoutRepository repository)
        : IRequestHandler<ListQueuedWorkoutsQuery, IReadOnlyList<QueuedWorkoutOut>>
    {
        public async Task<IReadOnlyList<QueuedWorkoutOut>> Handle(ListQueuedWorkoutsQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.ListForUserAsync(request.CurrentUserId, cancellationToken);
            return items
                .Select(q => new QueuedWorkoutOut(q.Id, q.RoutineId, q.CreatedAt, q.Source))
                .ToList();
        }
    }
}
