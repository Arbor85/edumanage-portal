using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record GetRoutineQuery(string RoutineId, string CurrentUserId) : IRequest<RoutineOut>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<GetRoutineQuery, RoutineOut>
    {
        public async Task<RoutineOut> Handle(GetRoutineQuery request, CancellationToken cancellationToken)
        {
            var routine = await repository.GetByIdAsync(request.RoutineId, cancellationToken)
                ?? throw new NotFoundException($"Routine '{request.RoutineId}' was not found.");

            if (routine.UserId != request.CurrentUserId)
                throw new UnauthorizedAccessException($"You do not have permission to view routine '{request.RoutineId}'.");

            return ListRoutinesQuery.Handler.MapToOut(routine);
        }
    }
}
