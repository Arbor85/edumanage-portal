using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IBuildingAvailabilityRepository : IRepository<BuildingAvailability, string>
{
    Task<IReadOnlyList<BuildingAvailability>> ListByBuildingAsync(string buildingId, CancellationToken cancellationToken);
}
