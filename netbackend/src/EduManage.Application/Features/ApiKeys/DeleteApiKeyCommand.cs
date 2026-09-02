using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.ApiKeys;

public sealed record DeleteApiKeyCommand(string KeyId, string CurrentUserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IApiKeyRepository repository)
        : IRequestHandler<DeleteApiKeyCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteApiKeyCommand request, CancellationToken cancellationToken)
        {
            var key = await repository.GetByIdAsync(request.KeyId, cancellationToken)
                ?? throw new NotFoundException($"API key '{request.KeyId}' was not found.");

            if (key.UserId != request.CurrentUserId)
                throw new UnauthorizedAccessException($"You do not have permission to delete API key '{request.KeyId}'.");

            await repository.DeleteByIdAsync(request.KeyId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "API key deleted" };
        }
    }
}
