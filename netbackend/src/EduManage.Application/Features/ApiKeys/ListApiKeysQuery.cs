using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.ApiKeys;

public sealed record ListApiKeysQuery(string CurrentUserId) : IRequest<IReadOnlyList<ApiKeyOut>>
{
    internal sealed class Handler(IApiKeyRepository repository)
        : IRequestHandler<ListApiKeysQuery, IReadOnlyList<ApiKeyOut>>
    {
        public async Task<IReadOnlyList<ApiKeyOut>> Handle(ListApiKeysQuery request, CancellationToken cancellationToken)
        {
            var all = await repository.ListAsync(cancellationToken);
            return all
                .Where(k => k.UserId == request.CurrentUserId)
                .Select(k => new ApiKeyOut(k.Id, k.Name, k.CreatedAt))
                .ToList();
        }
    }
}
