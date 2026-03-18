using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record AddRoutineCommand(RoutineCreate Request) : IRequest<RoutineOut>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<AddRoutineCommand, RoutineOut>
    {
        public Task<RoutineOut> Handle(AddRoutineCommand request, CancellationToken cancellationToken) =>
            repository.AddRoutineAsync(request.Request, cancellationToken);
    }
}