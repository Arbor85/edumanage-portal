using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Plans;

public sealed record ListPlansQuery : IRequest<IReadOnlyList<PlanOut>>;
public sealed record AddPlanCommand(PlanCreate Request) : IRequest<PlanOut>;
public sealed record GetPlanQuery(string PlanId) : IRequest<PlanOut>;
public sealed record UpdatePlanCommand(string PlanId, PlanUpdate Request) : IRequest<PlanOut>;
public sealed record DeletePlanCommand(string PlanId) : IRequest<Dictionary<string, string>>;
public sealed record UpdatePlanStatusCommand(string PlanId, PlanStatusUpdate Request) : IRequest<PlanOut>;

public sealed class ListPlansHandler(IEduManageRepository repository) : IRequestHandler<ListPlansQuery, IReadOnlyList<PlanOut>>
{
    public Task<IReadOnlyList<PlanOut>> Handle(ListPlansQuery request, CancellationToken cancellationToken) => repository.ListPlansAsync(cancellationToken);
}

public sealed class AddPlanHandler(IEduManageRepository repository) : IRequestHandler<AddPlanCommand, PlanOut>
{
    public Task<PlanOut> Handle(AddPlanCommand request, CancellationToken cancellationToken) => repository.AddPlanAsync(request.Request, cancellationToken);
}

public sealed class GetPlanHandler(IEduManageRepository repository) : IRequestHandler<GetPlanQuery, PlanOut>
{
    public Task<PlanOut> Handle(GetPlanQuery request, CancellationToken cancellationToken) => repository.GetPlanAsync(request.PlanId, cancellationToken);
}

public sealed class UpdatePlanHandler(IEduManageRepository repository) : IRequestHandler<UpdatePlanCommand, PlanOut>
{
    public Task<PlanOut> Handle(UpdatePlanCommand request, CancellationToken cancellationToken) => repository.UpdatePlanAsync(request.PlanId, request.Request, cancellationToken);
}

public sealed class DeletePlanHandler(IEduManageRepository repository) : IRequestHandler<DeletePlanCommand, Dictionary<string, string>>
{
    public Task<Dictionary<string, string>> Handle(DeletePlanCommand request, CancellationToken cancellationToken) => repository.DeletePlanAsync(request.PlanId, cancellationToken);
}

public sealed class UpdatePlanStatusHandler(IEduManageRepository repository) : IRequestHandler<UpdatePlanStatusCommand, PlanOut>
{
    public Task<PlanOut> Handle(UpdatePlanStatusCommand request, CancellationToken cancellationToken) => repository.UpdatePlanStatusAsync(request.PlanId, request.Request, cancellationToken);
}