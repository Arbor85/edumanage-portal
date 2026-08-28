using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IScheduleEntryRepository : IRepository<ScheduleEntry, string>
{
    Task<IReadOnlyList<ScheduleEntry>> ListByPlanAsync(string schedulePlanId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ScheduleEntry>> ListPublishedByTrainerAsync(string trainerUserId, CancellationToken cancellationToken);
    Task DeleteAllByPlanAsync(string schedulePlanId, CancellationToken cancellationToken);
}
