using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.UserProfiles;

public sealed record GetUserProfileQuery(string UserId) : IRequest<UserProfileOut?>
{
    internal sealed class Handler(IUserProfileRepository repository) : IRequestHandler<GetUserProfileQuery, UserProfileOut?>
    {
        public async Task<UserProfileOut?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var profile = await repository.GetByIdAsync(request.UserId, cancellationToken);

            return profile is null ? null : new UserProfileOut(profile.UserId, profile.Equipment);
        }
    }
}
