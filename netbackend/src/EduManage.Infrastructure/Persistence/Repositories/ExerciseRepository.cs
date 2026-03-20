using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ExerciseRepository(EduManageDbContext context)
    : BaseRepository<Exercise, int>(context), IExerciseRepository
{
}

