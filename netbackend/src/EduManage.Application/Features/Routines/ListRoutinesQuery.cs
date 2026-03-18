using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record ListRoutinesQuery : IRequest<IReadOnlyList<RoutineOut>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<ListRoutinesQuery, IReadOnlyList<RoutineOut>>
    {
        public Task<IReadOnlyList<RoutineOut>> Handle(ListRoutinesQuery request, CancellationToken cancellationToken) =>
            repository.ListRoutinesAsync(cancellationToken);
    }
}