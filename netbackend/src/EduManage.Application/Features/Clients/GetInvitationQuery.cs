using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients
{
    public record GetInvitationQuery(string InvitationCode) : IRequest<InvitationOut>
    {
        internal class Handler(IClientRepository repository) : IRequestHandler<GetInvitationQuery, InvitationOut>
        {
            public async Task<InvitationOut> Handle(GetInvitationQuery request, CancellationToken cancellationToken)
            {
                var client = await repository.GetByCodeAsync(request.InvitationCode, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.InvitationCode}' was not found.");


                if (client.Status != "Invited")
                    throw new UnauthorizedAccessException($"Invitation '{request.InvitationCode}' is already accepted.");

                return new InvitationOut(client.Name, client.ImageUrl);
            }
        }
    }
}