using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class BuildingAvailabilityRepository(EduManageDbContext context)
    : BaseRepository<BuildingAvailability, string>(context), IBuildingAvailabilityRepository
{
    public async Task<IReadOnlyList<BuildingAvailability>> ListByBuildingAsync(string buildingId, CancellationToken cancellationToken) =>
        await Context.BuildingAvailabilities.Where(a => a.BuildingId == buildingId).ToListAsync(cancellationToken);
}
