using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record ListPlansQuery : IRequest<IReadOnlyList<PlanOut>>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<ListPlansQuery, IReadOnlyList<PlanOut>>
    {
        public Task<IReadOnlyList<PlanOut>> Handle(ListPlansQuery request, CancellationToken cancellationToken) =>
            repository.ListPlansAsync(cancellationToken);
    }
}