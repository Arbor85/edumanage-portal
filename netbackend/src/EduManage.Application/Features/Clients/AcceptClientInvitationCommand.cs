using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record AcceptClientInvitationCommand(string InvitationCode, AcceptClientInvitationRequest Request, string CurrentUserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<AcceptClientInvitationCommand, ClientOut>
    {
        public async Task<ClientOut> Handle(AcceptClientInvitationCommand request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByCodeAsync(request.InvitationCode, cancellationToken)
                ?? throw new NotFoundException($"Client '{request.InvitationCode}' was not found.");

            client.AcceptInvitation(request.CurrentUserId);

            await repository.UpdateAsync(client, cancellationToken);
            return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.TrainerUserId);
        }
    }
}