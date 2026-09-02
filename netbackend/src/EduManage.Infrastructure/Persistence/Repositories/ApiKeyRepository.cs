using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ApiKeyRepository(EduManageDbContext context)
    : BaseRepository<McpApiKey, string>(context), IApiKeyRepository
{
    public async Task<McpApiKey?> GetByKeyAsync(string key, CancellationToken cancellationToken) =>
        await Context.McpApiKeys.FirstOrDefaultAsync(k => k.Key == key, cancellationToken);
}
