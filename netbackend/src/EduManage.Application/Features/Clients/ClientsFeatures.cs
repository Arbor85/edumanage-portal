using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record ListClientsQuery : IRequest<IReadOnlyList<ClientOut>>;
public sealed record AddClientCommand(ClientCreate Request) : IRequest<ClientOut>;
public sealed record EditClientCommand(string InvitationCode, ClientUpdate Request) : IRequest<ClientOut>;
public sealed record DeleteClientCommand(string InvitationCode) : IRequest<Dictionary<string, string>>;
public sealed record AcceptClientInvitationCommand(string InvitationCode, AcceptClientInvitationRequest Request) : IRequest<ClientOut>;

public sealed class ListClientsHandler(IEduManageRepository repository) : IRequestHandler<ListClientsQuery, IReadOnlyList<ClientOut>>
{
    public Task<IReadOnlyList<ClientOut>> Handle(ListClientsQuery request, CancellationToken cancellationToken) => repository.ListClientsAsync(cancellationToken);
}

public sealed class AddClientHandler(IEduManageRepository repository) : IRequestHandler<AddClientCommand, ClientOut>
{
    public Task<ClientOut> Handle(AddClientCommand request, CancellationToken cancellationToken) => repository.AddClientAsync(request.Request, cancellationToken);
}

public sealed class EditClientHandler(IEduManageRepository repository) : IRequestHandler<EditClientCommand, ClientOut>
{
    public Task<ClientOut> Handle(EditClientCommand request, CancellationToken cancellationToken) => repository.EditClientAsync(request.InvitationCode, request.Request, cancellationToken);
}

public sealed class DeleteClientHandler(IEduManageRepository repository) : IRequestHandler<DeleteClientCommand, Dictionary<string, string>>
{
    public Task<Dictionary<string, string>> Handle(DeleteClientCommand request, CancellationToken cancellationToken) => repository.DeleteClientAsync(request.InvitationCode, cancellationToken);
}

public sealed class AcceptClientInvitationHandler(IEduManageRepository repository) : IRequestHandler<AcceptClientInvitationCommand, ClientOut>
{
    public Task<ClientOut> Handle(AcceptClientInvitationCommand request, CancellationToken cancellationToken) => repository.AcceptClientInvitationAsync(request.InvitationCode, request.Request, cancellationToken);
}