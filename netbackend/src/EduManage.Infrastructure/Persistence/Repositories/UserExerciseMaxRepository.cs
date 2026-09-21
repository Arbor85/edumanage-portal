using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class UserExerciseMaxRepository(EduManageDbContext context)
    : IUserExerciseMaxRepository
{
    public Task<List<UserExerciseMax>> GetByUserIdAsync(string userId) =>
        context.UserExerciseMaxes
            .Include(x => x.Exercise)
            .Where(x => x.UserId == userId)
            .ToListAsync();

    public async Task UpsertAsync(UserExerciseMax max)
    {
        var existing = await context.UserExerciseMaxes.FindAsync(max.UserId, max.ExerciseId);
        if (existing is null)
        {
            context.UserExerciseMaxes.Add(max);
        }
        else
        {
            existing.MaxWeight = max.MaxWeight;
            existing.MaxReps = max.MaxReps;
            existing.MaxDuration = max.MaxDuration;
            existing.MaxDistance = max.MaxDistance;
            existing.Note = max.Note;
            existing.UpdatedAt = max.UpdatedAt;
        }
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string userId, int exerciseId)
    {
        var existing = await context.UserExerciseMaxes.FindAsync(userId, exerciseId);
        if (existing is not null)
        {
            context.UserExerciseMaxes.Remove(existing);
            await context.SaveChangesAsync();
        }
    }
}
