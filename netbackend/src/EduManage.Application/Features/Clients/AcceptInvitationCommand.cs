using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients
{
    public record AcceptInvitationCommand(string InvitationCode, string ImageUrl, string CurrentUserId) : IRequest
    {
        internal class Handler(IClientRepository repository) : IRequestHandler<AcceptInvitationCommand>
        {
            public async Task Handle(AcceptInvitationCommand request, CancellationToken cancellationToken)
            {
                var client = await repository.GetByCodeAsync(request.InvitationCode, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.InvitationCode}' was not found.");

                if (client.Status != "Invited")
                    throw new UnauthorizedAccessException($"Invitation '{request.InvitationCode}' is already accepted.");

                client.AcceptInvitation(request.CurrentUserId, request.ImageUrl);
                await repository.UpdateAsync(client, cancellationToken);
            }
        }
    }
}