using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class UserEquipmentRepository(EduManageDbContext context) : IUserEquipmentRepository
{
    public async Task<IReadOnlyList<UserEquipment>> GetByUserIdAsync(string userId, CancellationToken cancellationToken) =>
        await context.UserEquipment
            .Include(ue => ue.Equipment)
            .Where(ue => ue.UserId == userId)
            .ToListAsync(cancellationToken);

    public async Task ReplaceUserEquipmentAsync(string userId, List<UserEquipment> equipment, CancellationToken cancellationToken)
    {
        var existing = await context.UserEquipment
            .Where(ue => ue.UserId == userId)
            .ToListAsync(cancellationToken);

        context.UserEquipment.RemoveRange(existing);
        context.UserEquipment.AddRange(equipment);

        await context.SaveChangesAsync(cancellationToken);
    }
}
