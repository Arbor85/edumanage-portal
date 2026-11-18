using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.WorkoutQueue;

public sealed record DeleteQueuedWorkoutCommand(string Id, string CurrentUserId) : IRequest<bool>
{
    internal sealed class Handler(IQueuedWorkoutRepository repository)
        : IRequestHandler<DeleteQueuedWorkoutCommand, bool>
    {
        public Task<bool> Handle(DeleteQueuedWorkoutCommand request, CancellationToken cancellationToken) =>
            repository.DeleteForUserAsync(request.Id, request.CurrentUserId, cancellationToken);
    }
}
