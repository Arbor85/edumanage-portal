using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.WorkoutHistories;

public sealed record GetWorkoutHistoryQuery(string Id, string CurrentUserId) : IRequest<WorkoutHistoryOut>
{
    internal sealed class Handler(IWorkoutHistoryRepository repository)
        : IRequestHandler<GetWorkoutHistoryQuery, WorkoutHistoryOut>
    {
        public async Task<WorkoutHistoryOut> Handle(GetWorkoutHistoryQuery request, CancellationToken cancellationToken)
        {
            var history = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Workout history '{request.Id}' was not found.");

            if (history.CurrentUserId != request.CurrentUserId)
                throw new UnauthorizedAccessException($"You do not have permission to view workout history '{request.Id}'.");

            return ListWorkoutHistoryQuery.Handler.MapToOut(history);
        }
    }
}
