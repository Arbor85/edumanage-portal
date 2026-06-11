using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IUserEquipmentRepository
{
    Task<IReadOnlyList<UserEquipment>> GetByUserIdAsync(string userId, CancellationToken cancellationToken);
    Task ReplaceUserEquipmentAsync(string userId, List<UserEquipment> equipment, CancellationToken cancellationToken);
}
