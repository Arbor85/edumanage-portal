using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record DeleteRoutineCommand(string RoutineId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<DeleteRoutineCommand, Dictionary<string, string>>
    {
        public Task<Dictionary<string, string>> Handle(DeleteRoutineCommand request, CancellationToken cancellationToken) =>
            repository.DeleteRoutineAsync(request.RoutineId, cancellationToken);
    }
}