using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class FormResponseRepository(EduManageDbContext context)
    : BaseRepository<FormResponse, string>(context), IFormResponseRepository
{
    public async Task<IReadOnlyList<FormResponse>> ListByClientAsync(string clientId, CancellationToken cancellationToken) =>
        await Context.FormResponses
            .Where(r => r.ClientId == clientId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
}
