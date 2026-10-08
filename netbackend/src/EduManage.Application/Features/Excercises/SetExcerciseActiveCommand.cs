using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record SetExcerciseActiveCommand(int Id, bool IsActive) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<SetExcerciseActiveCommand, ExcerciseOut>
    {
        public async Task<ExcerciseOut> Handle(SetExcerciseActiveCommand request, CancellationToken cancellationToken)
        {
            var exercise = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Excercise '{request.Id}' was not found.");

            exercise.IsActive = request.IsActive;
            await repository.UpdateAsync(exercise, cancellationToken);

            return ListExcercisesQuery.Handler.ToOut(exercise, null);
        }
    }
}
