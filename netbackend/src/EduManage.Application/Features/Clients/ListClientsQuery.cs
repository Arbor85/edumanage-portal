using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record ListClientsQuery(string? UserId) : IRequest<IReadOnlyList<ClientOut>>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<ListClientsQuery, IReadOnlyList<ClientOut>>
    {
        public Task<IReadOnlyList<ClientOut>> Handle(ListClientsQuery request, CancellationToken cancellationToken) =>
            repository.ListClientsAsync(request.UserId, cancellationToken);
    }
}