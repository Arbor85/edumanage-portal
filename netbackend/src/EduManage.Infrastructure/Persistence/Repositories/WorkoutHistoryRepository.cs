using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class WorkoutHistoryRepository(EduManageDbContext context)
    : BaseRepository<WorkoutHistory, string>(context), IWorkoutHistoryRepository
{
}

