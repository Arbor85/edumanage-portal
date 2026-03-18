using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ExerciseRepository : IExerciseRepository
{
    private readonly EduManageDbContext _context;

    public ExerciseRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken)
    {
        var exercises = await _context.Exercises.ToListAsync(cancellationToken);
        return exercises.Select(ToOut).ToList();
    }

    public async Task<ExcerciseOut> AddExcerciseAsync(ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        var exercise = new Exercise
        {
            Name = request.Name,
            ShortDescription = request.ShortDescription ?? string.Empty,
            PrimaryMuscle = request.PrimaryMuscle,
            SecondaryMuscles = NormalizeSecondaryMuscles(request.PrimaryMuscle, request.SecondaryMuscles),
            Muscles = [],
            Tags = request.Tags?.ToList() ?? []
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync(cancellationToken);

        return ToOut(exercise);
    }

    public async Task<ExcerciseOut> UpdateExcerciseAsync(int id, ExcerciseWriteRequest request, CancellationToken cancellationToken)
    {
        var exercise = await _context.Exercises.FindAsync([id], cancellationToken: cancellationToken);
        if (exercise is null)
        {
            throw new NotFoundException($"Excercise '{id}' was not found.");
        }

        exercise.Name = request.Name;
        exercise.ShortDescription = request.ShortDescription ?? string.Empty;
        exercise.PrimaryMuscle = request.PrimaryMuscle;
        exercise.SecondaryMuscles = NormalizeSecondaryMuscles(request.PrimaryMuscle, request.SecondaryMuscles);
        exercise.Tags = request.Tags?.ToList() ?? [];

        await _context.SaveChangesAsync(cancellationToken);

        return ToOut(exercise);
    }

    public async Task DeleteExcerciseAsync(int id, CancellationToken cancellationToken)
    {
        var exercise = await _context.Exercises.FindAsync([id], cancellationToken: cancellationToken);
        if (exercise is null)
        {
            throw new NotFoundException($"Excercise '{id}' was not found.");
        }

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static ExcerciseOut ToOut(Exercise exercise)
    {
        return new ExcerciseOut(
            exercise.Id,
            exercise.Name,
            exercise.ShortDescription,
            exercise.PrimaryMuscle,
            exercise.SecondaryMuscles,
            exercise.Muscles,
            exercise.Tags);
    }

    private static List<string> NormalizeSecondaryMuscles(string primaryMuscle, IReadOnlyList<string>? secondaryMuscles)
    {
        if (secondaryMuscles is null)
        {
            return [];
        }

        var result = new List<string>();
        var comparer = StringComparer.OrdinalIgnoreCase;

        foreach (var muscle in secondaryMuscles)
        {
            if (string.IsNullOrWhiteSpace(muscle))
            {
                continue;
            }

            if (comparer.Equals(muscle, primaryMuscle))
            {
                continue;
            }

            if (result.Any(existing => comparer.Equals(existing, muscle)))
            {
                continue;
            }

            result.Add(muscle);
        }

        return result;
    }
}
