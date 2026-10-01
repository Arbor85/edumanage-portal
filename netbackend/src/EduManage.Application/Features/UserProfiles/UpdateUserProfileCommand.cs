using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.UserProfiles;

public sealed record UpdateUserProfileCommand(string UserId, UserProfileUpdate Request) : IRequest<UserProfileOut>
{
    internal sealed class Handler(IUserProfileRepository repository) : IRequestHandler<UpdateUserProfileCommand, UserProfileOut>
    {
        public async Task<UserProfileOut> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var profile = await repository.GetByIdAsync(request.UserId, cancellationToken);

            if (profile is null)
            {
                profile = new UserProfile
                {
                    UserId = request.UserId,
                    Equipment = request.Request.Equipment ?? []
                };
                await repository.AddAsync(profile, cancellationToken);
            }
            else
            {
                if (request.Request.Equipment is not null)
                    profile.Equipment = request.Request.Equipment;

                await repository.UpdateAsync(profile, cancellationToken);
            }

            return new UserProfileOut(profile.UserId, profile.Equipment);
        }
    }
}
