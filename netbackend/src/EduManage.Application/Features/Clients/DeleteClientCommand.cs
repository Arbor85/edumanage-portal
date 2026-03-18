using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record DeleteClientCommand(string InvitationCode, string? UserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<DeleteClientCommand, Dictionary<string, string>>
    {
        public Task<Dictionary<string, string>> Handle(DeleteClientCommand request, CancellationToken cancellationToken) =>
            repository.DeleteClientAsync(request.InvitationCode, request.UserId, cancellationToken);
    }
}