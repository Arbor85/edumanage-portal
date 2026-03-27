using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record DeleteRoutineCommand(string RoutineId, string CurrentUserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<DeleteRoutineCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteRoutineCommand request, CancellationToken cancellationToken)
        {
            var routine = await repository.GetByIdAsync(request.RoutineId, cancellationToken)
                ?? throw new NotFoundException($"Routine '{request.RoutineId}' was not found.");

            if (routine.UserId != request.CurrentUserId)
            {
                throw new UnauthorizedAccessException($"You do not have permission to delete routine '{request.RoutineId}'.");
            }

            await repository.DeleteByIdAsync(request.RoutineId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Routine deleted" };
        }
    }
}