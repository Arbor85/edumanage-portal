using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class FormTemplateRepository(EduManageDbContext context)
    : BaseRepository<FormTemplate, string>(context), IFormTemplateRepository
{
    protected override IQueryable<FormTemplate> GetQuery() =>
        Context.FormTemplates
            .Include(f => f.Versions);

    public override async Task<FormTemplate?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await GetQuery().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IReadOnlyList<FormTemplate>> ListByTrainerAsync(string trainerUserId, CancellationToken cancellationToken) =>
        await GetQuery()
            .Where(f => f.TrainerUserId == trainerUserId)
            .ToListAsync(cancellationToken);
}
