using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Routines;

public sealed record CompleteRoutineCommand(CompleteRoutineCreate Request) : IRequest<WorkoutHistoryOut>
{
    internal sealed class Handler(IWorkoutHistoryRepository repository) : IRequestHandler<CompleteRoutineCommand, WorkoutHistoryOut>
    {
        public async Task<WorkoutHistoryOut> Handle(CompleteRoutineCommand request, CancellationToken cancellationToken)
        {
            var exercises = request.Request.Excercises?.Count > 0
                ? request.Request.Excercises
                : request.Request.Exercises ?? [];

            var workoutHistory = new WorkoutHistory
            {
                Id = Guid.NewGuid().ToString("N"),
                CurrentUserId = "local-user",
                Mode = request.Request.Mode,
                StartedAt = request.Request.StartedAt,
                CompletedAt = request.Request.CompletedAt,
                DurationSeconds = request.Request.DurationSeconds,
                TotalSets = request.Request.TotalSets,
                CompletedSets = request.Request.CompletedSets,
                SourceWorkout = new SourceWorkout
                {
                    WorkoutId = request.Request.SourceWorkout.Id,
                    Name = request.Request.SourceWorkout.Name,
                    Date = request.Request.SourceWorkout.Date
                },
                Exercises = exercises.Select(e => new CompletedExercise
                {
                    Name = e.Name,
                    IsBodyweight = e.IsBodyweight,
                    Sets = e.Sets.Select(s => new CompletedSet
                    {
                        Type = s.Type,
                        Reps = s.Reps,
                        Weight = s.Weight,
                        Notes = s.Note,
                        Completed = s.Completed
                    }).ToList()
                }).ToList()
            };

            await repository.AddAsync(workoutHistory, cancellationToken);

            return new WorkoutHistoryOut(
                workoutHistory.Id,
                workoutHistory.CurrentUserId,
                workoutHistory.Mode,
                workoutHistory.StartedAt,
                workoutHistory.CompletedAt,
                workoutHistory.DurationSeconds,
                workoutHistory.TotalSets,
                workoutHistory.CompletedSets,
                exercises,
                request.Request.SourceWorkout);
        }
    }
}