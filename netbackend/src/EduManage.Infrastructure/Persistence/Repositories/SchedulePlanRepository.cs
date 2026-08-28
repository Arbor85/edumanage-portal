using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class SchedulePlanRepository(EduManageDbContext context)
    : BaseRepository<SchedulePlan, string>(context), ISchedulePlanRepository
{
    public async Task<IReadOnlyList<SchedulePlan>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken) =>
        await Context.SchedulePlans.Where(p => p.OrganizationId == organizationId).ToListAsync(cancellationToken);
}
