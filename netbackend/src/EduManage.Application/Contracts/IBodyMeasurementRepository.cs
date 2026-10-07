using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IBodyMeasurementRepository
{
    Task<IReadOnlyList<BodyMeasurement>> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<BodyMeasurement?> GetByIdAsync(string id, CancellationToken ct = default);
    Task AddAsync(BodyMeasurement measurement, CancellationToken ct = default);
    Task DeleteAsync(BodyMeasurement measurement, CancellationToken ct = default);
}
