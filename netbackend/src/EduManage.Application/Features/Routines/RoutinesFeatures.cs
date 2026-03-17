using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record ListRoutinesQuery : IRequest<IReadOnlyList<RoutineOut>>;
public sealed record AddRoutineCommand(RoutineCreate Request) : IRequest<RoutineOut>;
public sealed record UpdateRoutineCommand(string RoutineId, RoutineUpdate Request) : IRequest<RoutineOut>;
public sealed record DeleteRoutineCommand(string RoutineId) : IRequest<Dictionary<string, string>>;
public sealed record CompleteRoutineCommand(CompleteRoutineCreate Request) : IRequest<WorkoutHistoryOut>;

public sealed class ListRoutinesHandler(IEduManageRepository repository) : IRequestHandler<ListRoutinesQuery, IReadOnlyList<RoutineOut>>
{
    public Task<IReadOnlyList<RoutineOut>> Handle(ListRoutinesQuery request, CancellationToken cancellationToken) => repository.ListRoutinesAsync(cancellationToken);
}

public sealed class AddRoutineHandler(IEduManageRepository repository) : IRequestHandler<AddRoutineCommand, RoutineOut>
{
    public Task<RoutineOut> Handle(AddRoutineCommand request, CancellationToken cancellationToken) => repository.AddRoutineAsync(request.Request, cancellationToken);
}

public sealed class UpdateRoutineHandler(IEduManageRepository repository) : IRequestHandler<UpdateRoutineCommand, RoutineOut>
{
    public Task<RoutineOut> Handle(UpdateRoutineCommand request, CancellationToken cancellationToken) => repository.UpdateRoutineAsync(request.RoutineId, request.Request, cancellationToken);
}

public sealed class DeleteRoutineHandler(IEduManageRepository repository) : IRequestHandler<DeleteRoutineCommand, Dictionary<string, string>>
{
    public Task<Dictionary<string, string>> Handle(DeleteRoutineCommand request, CancellationToken cancellationToken) => repository.DeleteRoutineAsync(request.RoutineId, cancellationToken);
}

public sealed class CompleteRoutineHandler(IEduManageRepository repository) : IRequestHandler<CompleteRoutineCommand, WorkoutHistoryOut>
{
    public Task<WorkoutHistoryOut> Handle(CompleteRoutineCommand request, CancellationToken cancellationToken) => repository.CompleteRoutineAsync(request.Request, cancellationToken);
}