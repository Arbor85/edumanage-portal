using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record DeleteRoutineCommand(string RoutineId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<DeleteRoutineCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteRoutineCommand request, CancellationToken cancellationToken)
        {
            await repository.DeleteByIdAsync(request.RoutineId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Routine deleted" };
        }
    }
}