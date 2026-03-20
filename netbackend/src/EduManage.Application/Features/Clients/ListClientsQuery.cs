using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record ListClientsQuery(string? UserId) : IRequest<IReadOnlyList<ClientOut>>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<ListClientsQuery, IReadOnlyList<ClientOut>>
    {
        public async Task<IReadOnlyList<ClientOut>> Handle(ListClientsQuery request, CancellationToken cancellationToken)
        {
            var clients = await repository.ListAsync(cancellationToken);
            return clients
                .Where(c => c.TrainerUserId == request.UserId)
                .Select(c => new ClientOut(c.Name, c.Tags, c.ImageUrl, c.Status, c.InvitationCode, c.TrainerUserId))
                .ToList();
        }
    }
}