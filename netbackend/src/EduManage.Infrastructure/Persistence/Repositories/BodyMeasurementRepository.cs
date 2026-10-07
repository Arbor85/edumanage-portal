using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class BodyMeasurementRepository(EduManageDbContext context) : IBodyMeasurementRepository
{
    public async Task<IReadOnlyList<BodyMeasurement>> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await context.BodyMeasurements
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Date)
            .ToListAsync(ct);

    public async Task<BodyMeasurement?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await context.BodyMeasurements.FindAsync([id], ct);

    public async Task AddAsync(BodyMeasurement measurement, CancellationToken ct = default)
    {
        context.BodyMeasurements.Add(measurement);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(BodyMeasurement measurement, CancellationToken ct = default)
    {
        context.BodyMeasurements.Remove(measurement);
        await context.SaveChangesAsync(ct);
    }
}
