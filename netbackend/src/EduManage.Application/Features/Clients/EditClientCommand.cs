using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record EditClientCommand(string InvitationCode, ClientUpdate Request, string? UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<EditClientCommand, ClientOut>
    {
        public Task<ClientOut> Handle(EditClientCommand request, CancellationToken cancellationToken) =>
            repository.EditClientAsync(request.InvitationCode, request.Request, request.UserId, cancellationToken);
    }
}