using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IBuildingRepository : IRepository<Building, string>
{
    Task<IReadOnlyList<Building>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken);
}
