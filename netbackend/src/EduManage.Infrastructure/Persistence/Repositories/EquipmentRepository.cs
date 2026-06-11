using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class EquipmentRepository(EduManageDbContext context)
    : BaseRepository<Equipment, Guid>(context), IEquipmentRepository
{
}
