using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.ApiKeys;

public sealed record AddApiKeyCommand(ApiKeyCreate Request, string CurrentUserId) : IRequest<ApiKeyCreatedOut>
{
    internal sealed class Handler(IApiKeyRepository repository)
        : IRequestHandler<AddApiKeyCommand, ApiKeyCreatedOut>
    {
        public async Task<ApiKeyCreatedOut> Handle(AddApiKeyCommand request, CancellationToken cancellationToken)
        {
            var key = new McpApiKey
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                Key = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"),
                UserId = request.CurrentUserId,
                CreatedAt = DateTime.UtcNow.ToString("o")
            };

            await repository.AddAsync(key, cancellationToken);
            return new ApiKeyCreatedOut(key.Id, key.Name, key.Key, key.CreatedAt);
        }
    }
}
