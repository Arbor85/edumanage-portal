using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record EditClientCommand(string InvitationCode, ClientUpdate Request, string? UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<EditClientCommand, ClientOut>
    {
        public async Task<ClientOut> Handle(EditClientCommand request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByIdAsync(request.InvitationCode, cancellationToken)
                ?? throw new NotFoundException($"Client '{request.InvitationCode}' was not found.");

            if (client.TrainerUserId != request.UserId)
                throw new UnauthorizedAccessException($"You do not have permission to edit client '{request.InvitationCode}'.");

            client.Update(request.Request.Name, request.Request.Tags);

            await repository.UpdateAsync(client, cancellationToken);

            return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.TrainerUserId);
        }
    }
}