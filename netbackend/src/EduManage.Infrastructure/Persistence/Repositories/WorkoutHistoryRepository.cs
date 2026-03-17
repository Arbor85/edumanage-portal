using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using DomainCompletedSet = EduManage.Domain.Entities.CompletedSet;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class WorkoutHistoryRepository : IWorkoutHistoryRepository
{
    private readonly EduManageDbContext _context;

    public WorkoutHistoryRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken)
    {
        var excercises = request.Excercises?.Count > 0
            ? request.Excercises
            : request.Exercises ?? [];

        var sourceWorkout = new SourceWorkout
        {
            WorkoutId = request.SourceWorkout.Id,
            Name = request.SourceWorkout.Name,
            Date = request.SourceWorkout.Date
        };

        var workoutHistory = new WorkoutHistory
        {
            Id = Guid.NewGuid().ToString("N"),
            CurrentUserId = "local-user",
            Mode = request.Mode,
            StartedAt = request.StartedAt,
            CompletedAt = request.CompletedAt,
            DurationSeconds = request.DurationSeconds,
            TotalSets = request.TotalSets,
            CompletedSets = request.CompletedSets,
            SourceWorkout = sourceWorkout,
            Exercises = excercises.Select(e => new CompletedExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainCompletedSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Notes,
                    Completed = s.Completed
                }).ToList()
            }).ToList()
        };

        _context.WorkoutHistory.Add(workoutHistory);
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkoutHistoryOut(
            workoutHistory.Id,
            workoutHistory.CurrentUserId,
            workoutHistory.Mode,
            workoutHistory.StartedAt,
            workoutHistory.CompletedAt,
            workoutHistory.DurationSeconds,
            workoutHistory.TotalSets,
            workoutHistory.CompletedSets,
            excercises,
            request.SourceWorkout
        );
    }
}
