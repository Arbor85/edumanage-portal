using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class PlanRepository(EduManageDbContext context)
    : BaseRepository<Plan, string>(context), IPlanRepository
{
    protected override IQueryable<Plan> GetQuery() =>
        Context.Plans
            .Include(p => p.Client);

    public override async Task<Plan?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await GetQuery().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
}