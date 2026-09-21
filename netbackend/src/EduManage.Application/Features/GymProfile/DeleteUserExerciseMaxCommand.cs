using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.GymProfile;

public sealed record DeleteUserExerciseMaxCommand(string UserId, int ExerciseId) : IRequest
{
    internal sealed class Handler(IUserExerciseMaxRepository repository)
        : IRequestHandler<DeleteUserExerciseMaxCommand>
    {
        public Task Handle(DeleteUserExerciseMaxCommand request, CancellationToken cancellationToken) =>
            repository.DeleteAsync(request.UserId, request.ExerciseId);
    }
}
