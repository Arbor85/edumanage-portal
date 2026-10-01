using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class StandaloneFormResponseRepository(EduManageDbContext context)
    : BaseRepository<StandaloneFormResponse, string>(context), IStandaloneFormResponseRepository
{
    public async Task<IReadOnlyList<StandaloneFormResponse>> ListByTemplateAsync(string formTemplateId, string trainerUserId, CancellationToken cancellationToken) =>
        await Context.StandaloneFormResponses
            .Where(r => r.FormTemplateId == formTemplateId && r.TrainerUserId == trainerUserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
}
