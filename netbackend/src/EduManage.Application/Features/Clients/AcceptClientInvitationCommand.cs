using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record AcceptClientInvitationCommand(string InvitationCode, AcceptClientInvitationRequest Request, string? UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<AcceptClientInvitationCommand, ClientOut>
    {
        public Task<ClientOut> Handle(AcceptClientInvitationCommand request, CancellationToken cancellationToken) =>
            repository.AcceptClientInvitationAsync(request.InvitationCode, request.Request, request.UserId, cancellationToken);
    }
}