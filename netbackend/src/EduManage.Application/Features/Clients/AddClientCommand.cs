using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record AddClientCommand(ClientCreate Request, string UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<AddClientCommand, ClientOut>
    {
        public async Task<ClientOut> Handle(AddClientCommand request, CancellationToken cancellationToken)
        {
            var invitationCode = string.IsNullOrWhiteSpace(request.Request.InvitationCode)
                ? Guid.NewGuid().ToString("N")[..8]
                : request.Request.InvitationCode;

            var client = new Client(invitationCode, request.Request.Name, request.UserId)
            {
                Tags = [.. request.Request.Tags],
                ImageUrl = string.Empty
            };

            await repository.AddAsync(client, cancellationToken);
            return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.TrainerUserId);
        }
    }
}