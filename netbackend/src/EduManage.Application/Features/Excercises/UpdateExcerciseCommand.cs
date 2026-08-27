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
            exercise.ActivityType = request.Request.ActivityType;
            exercise.ActivityTrackType = request.Request.ActivityTrackType;
            exercise.Instructions = request.Request.Instructions?.ToList();
            exercise.Equipment = request.Request.Equipment;
            exercise.Level = request.Request.Level;
            exercise.Force = request.Request.Force;
            exercise.Mechanic = request.Request.Mechanic;
            exercise.Category = request.Request.Category;
            exercise.ImagePath = request.Request.ImagePath;
            exercise.GifPath = request.Request.GifPath;
            exercise.DatasetId = request.Request.DatasetId;

            await repository.UpdateAsync(exercise, cancellationToken);
            return ListExcercisesQuery.Handler.ToOut(exercise, null);
        }
    }
}