using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class UserExercisePreferenceRepository(EduManageDbContext context)
    : IUserExercisePreferenceRepository
{
    public Task<List<UserExercisePreference>> GetByUserIdAsync(string userId) =>
        context.UserExercisePreferences
            .Where(x => x.UserId == userId)
            .ToListAsync();

    public async Task UpsertAsync(string userId, int exerciseId, Action<UserExercisePreference> update)
    {
        var pref = await context.UserExercisePreferences.FindAsync(userId, exerciseId);
        if (pref is null)
        {
            pref = new UserExercisePreference { UserId = userId, ExerciseId = exerciseId };
            context.UserExercisePreferences.Add(pref);
        }
        update(pref);
        await context.SaveChangesAsync();
    }
}
