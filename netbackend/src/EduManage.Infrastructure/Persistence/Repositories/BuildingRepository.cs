using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class BuildingRepository(EduManageDbContext context)
    : BaseRepository<Building, string>(context), IBuildingRepository
{
    public async Task<IReadOnlyList<Building>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken) =>
        await Context.Buildings.Where(b => b.OrganizationId == organizationId).ToListAsync(cancellationToken);
}
