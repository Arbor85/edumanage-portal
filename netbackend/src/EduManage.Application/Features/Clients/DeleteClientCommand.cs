using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record DeleteClientCommand(string InvitationCode, string? UserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<DeleteClientCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteClientCommand request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByIdAsync(request.InvitationCode, cancellationToken)
                ?? throw new NotFoundException($"Client '{request.InvitationCode}' was not found.");

            if (client.TrainerUserId != request.UserId)
                throw new UnauthorizedAccessException($"You do not have permission to delete client '{request.InvitationCode}'.");

            await repository.DeleteByIdAsync(request.InvitationCode, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Client deleted" };
        }
    }
}