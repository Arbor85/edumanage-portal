using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record ListExcercisesQuery : IRequest<IReadOnlyList<ExcerciseOut>>;

public sealed class ListExcercisesHandler(IEduManageRepository repository) : IRequestHandler<ListExcercisesQuery, IReadOnlyList<ExcerciseOut>>
{
    public Task<IReadOnlyList<ExcerciseOut>> Handle(ListExcercisesQuery request, CancellationToken cancellationToken) => repository.ListExcercisesAsync(cancellationToken);
}