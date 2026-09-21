using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.GymProfile;

public sealed record GetGymProfileQuery(string UserId) : IRequest<IReadOnlyList<UserExerciseMaxOut>>
{
    internal sealed class Handler(IUserExerciseMaxRepository repository)
        : IRequestHandler<GetGymProfileQuery, IReadOnlyList<UserExerciseMaxOut>>
    {
        public async Task<IReadOnlyList<UserExerciseMaxOut>> Handle(GetGymProfileQuery request, CancellationToken cancellationToken)
        {
            var maxes = await repository.GetByUserIdAsync(request.UserId);
            return maxes.Select(MapToOut).ToList();
        }

        internal static UserExerciseMaxOut MapToOut(UserExerciseMax m) => new(
            m.UserId,
            m.ExerciseId,
            m.Exercise.Name,
            m.Exercise.ActivityTrackType.ToString().ToLowerInvariant(),
            m.Exercise.PrimaryMuscle,
            m.MaxWeight,
            m.MaxReps,
            m.MaxDuration,
            m.MaxDistance,
            m.Note,
            m.UpdatedAt);
    }
}
