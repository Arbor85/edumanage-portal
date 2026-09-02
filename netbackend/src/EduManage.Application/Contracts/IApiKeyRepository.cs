using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IApiKeyRepository : IRepository<McpApiKey, string>
{
    Task<McpApiKey?> GetByKeyAsync(string key, CancellationToken cancellationToken);
}
