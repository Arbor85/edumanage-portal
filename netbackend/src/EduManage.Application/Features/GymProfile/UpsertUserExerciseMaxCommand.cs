using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.GymProfile;

public sealed record UpsertUserExerciseMaxCommand(
    string UserId,
    int ExerciseId,
    UserExerciseMaxUpsert Request) : IRequest<UserExerciseMaxOut>
{
    internal sealed class Handler(
        IUserExerciseMaxRepository repository,
        IExerciseRepository exerciseRepository)
        : IRequestHandler<UpsertUserExerciseMaxCommand, UserExerciseMaxOut>
    {
        public async Task<UserExerciseMaxOut> Handle(UpsertUserExerciseMaxCommand request, CancellationToken cancellationToken)
        {
            var exercise = await exerciseRepository.GetByIdAsync(request.ExerciseId, cancellationToken)
                ?? throw new NotFoundException($"Exercise '{request.ExerciseId}' was not found.");

            var max = new UserExerciseMax
            {
                UserId = request.UserId,
                ExerciseId = request.ExerciseId,
                Exercise = exercise,
                MaxWeight = request.Request.MaxWeight,
                MaxReps = request.Request.MaxReps,
                MaxDuration = request.Request.MaxDuration,
                MaxDistance = request.Request.MaxDistance,
                Note = request.Request.Note,
                UpdatedAt = DateTime.UtcNow,
            };

            await repository.UpsertAsync(max);
            return GetGymProfileQuery.Handler.MapToOut(max);
        }
    }
}
