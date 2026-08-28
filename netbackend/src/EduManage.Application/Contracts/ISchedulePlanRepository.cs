using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface ISchedulePlanRepository : IRepository<SchedulePlan, string>
{
    Task<IReadOnlyList<SchedulePlan>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken);
}
