using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IUserExercisePreferenceRepository
{
    Task<List<UserExercisePreference>> GetByUserIdAsync(string userId);
    Task UpsertAsync(string userId, int exerciseId, Action<UserExercisePreference> update);
}
