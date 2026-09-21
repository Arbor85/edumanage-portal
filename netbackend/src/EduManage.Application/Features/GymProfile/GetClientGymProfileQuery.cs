using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.GymProfile;

public sealed record GetClientGymProfileQuery(string ClientUserId) : IRequest<IReadOnlyList<UserExerciseMaxOut>>
{
    internal sealed class Handler(IUserExerciseMaxRepository repository)
        : IRequestHandler<GetClientGymProfileQuery, IReadOnlyList<UserExerciseMaxOut>>
    {
        public async Task<IReadOnlyList<UserExerciseMaxOut>> Handle(GetClientGymProfileQuery request, CancellationToken cancellationToken)
        {
            var maxes = await repository.GetByUserIdAsync(request.ClientUserId);
            return maxes.Select(GetGymProfileQuery.Handler.MapToOut).ToList();
        }
    }
}
