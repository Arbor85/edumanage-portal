using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record AddClientCommand(ClientCreate Request, string? UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<AddClientCommand, ClientOut>
    {
        public Task<ClientOut> Handle(AddClientCommand request, CancellationToken cancellationToken) =>
            repository.AddClientAsync(request.Request, request.UserId, cancellationToken);
    }
}