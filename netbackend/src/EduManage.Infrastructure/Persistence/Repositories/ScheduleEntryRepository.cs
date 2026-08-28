using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ScheduleEntryRepository(EduManageDbContext context)
    : BaseRepository<ScheduleEntry, string>(context), IScheduleEntryRepository
{
    public async Task<IReadOnlyList<ScheduleEntry>> ListByPlanAsync(string schedulePlanId, CancellationToken cancellationToken) =>
        await Context.ScheduleEntries.Where(e => e.SchedulePlanId == schedulePlanId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ScheduleEntry>> ListPublishedByTrainerAsync(string trainerUserId, CancellationToken cancellationToken) =>
        await Context.ScheduleEntries
            .Where(e => e.TrainerUserId == trainerUserId && e.Plan.Status == "Published")
            .ToListAsync(cancellationToken);

    public async Task DeleteAllByPlanAsync(string schedulePlanId, CancellationToken cancellationToken)
    {
        var entries = await Context.ScheduleEntries.Where(e => e.SchedulePlanId == schedulePlanId).ToListAsync(cancellationToken);
        Context.ScheduleEntries.RemoveRange(entries);
        await Context.SaveChangesAsync(cancellationToken);
    }
}
