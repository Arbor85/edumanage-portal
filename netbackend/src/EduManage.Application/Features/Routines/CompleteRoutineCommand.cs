using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record CompleteRoutineCommand(CompleteRoutineCreate Request) : IRequest<WorkoutHistoryOut>
{
    internal sealed class Handler(IWorkoutHistoryRepository repository) : IRequestHandler<CompleteRoutineCommand, WorkoutHistoryOut>
    {
        public Task<WorkoutHistoryOut> Handle(CompleteRoutineCommand request, CancellationToken cancellationToken) =>
            repository.CompleteRoutineAsync(request.Request, cancellationToken);
    }
}