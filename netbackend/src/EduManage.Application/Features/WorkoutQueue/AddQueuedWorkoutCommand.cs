using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.WorkoutQueue;

public sealed record AddQueuedWorkoutCommand(QueuedWorkoutCreate Request, string CurrentUserId) : IRequest<QueuedWorkoutOut>
{
    internal sealed class Handler(IQueuedWorkoutRepository repository)
        : IRequestHandler<AddQueuedWorkoutCommand, QueuedWorkoutOut>
    {
        public async Task<QueuedWorkoutOut> Handle(AddQueuedWorkoutCommand request, CancellationToken cancellationToken)
        {
            var entity = new QueuedWorkout
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = request.CurrentUserId,
                RoutineId = request.Request.RoutineId,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                Source = request.Request.Source ?? "api",
            };

            await repository.AddAsync(entity, cancellationToken);
            return new QueuedWorkoutOut(entity.Id, entity.RoutineId, entity.CreatedAt, entity.Source);
        }
    }
}
