using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record UpdateRoutineCommand(string RoutineId, RoutineUpdate Request) : IRequest<RoutineOut>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<UpdateRoutineCommand, RoutineOut>
    {
        public Task<RoutineOut> Handle(UpdateRoutineCommand request, CancellationToken cancellationToken) =>
            repository.UpdateRoutineAsync(request.RoutineId, request.Request, cancellationToken);
    }
}