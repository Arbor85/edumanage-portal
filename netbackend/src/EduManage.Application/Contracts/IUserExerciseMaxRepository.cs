using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IUserExerciseMaxRepository
{
    Task<List<UserExerciseMax>> GetByUserIdAsync(string userId);
    Task UpsertAsync(UserExerciseMax max);
    Task DeleteAsync(string userId, int exerciseId);
}
