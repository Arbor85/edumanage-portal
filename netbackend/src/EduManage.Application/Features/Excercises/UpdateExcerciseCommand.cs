using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record UpdateExcerciseCommand(int Id, ExcerciseWriteRequest Request) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<UpdateExcerciseCommand, ExcerciseOut>
    {
        public async Task<ExcerciseOut> Handle(UpdateExcerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Excercise '{request.Id}' was not found.");

            exercise.Name = request.Request.Name;
            exercise.ShortDescription = request.Request.ShortDescription ?? string.Empty;
            exercise.PrimaryMuscle = request.Request.PrimaryMuscle;
            exercise.SecondaryMuscles = AddExcerciseCommand.Handler.NormalizeSecondaryMuscles(
                request.Request.PrimaryMuscle, request.Request.SecondaryMuscles);
            exercise.Tags = request.Request.Tags?.ToList() ?? [];

            await repository.UpdateAsync(exercise, cancellationToken);
            return ListExcercisesQuery.Handler.ToOut(exercise);
        }
    }
}