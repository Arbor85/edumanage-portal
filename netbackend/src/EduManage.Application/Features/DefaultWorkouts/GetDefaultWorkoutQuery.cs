using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.DefaultWorkouts;

public sealed record GetDefaultWorkoutQuery(string Id) : IRequest<DefaultWorkoutOut>
{
    internal sealed class Handler(IDefaultWorkoutRepository repository)
        : IRequestHandler<GetDefaultWorkoutQuery, DefaultWorkoutOut>
    {
        public async Task<DefaultWorkoutOut> Handle(GetDefaultWorkoutQuery request, CancellationToken cancellationToken)
        {
            var defaultWorkout = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Default workout '{request.Id}' was not found.");

            return ListDefaultWorkoutsQuery.Handler.ToOut(defaultWorkout);
        }
    }
}
