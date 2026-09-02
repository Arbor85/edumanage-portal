using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.WorkoutHistories;

public sealed record ListWorkoutHistoryQuery(
    string CurrentUserId,
    string? From = null,
    string? To = null) : IRequest<IReadOnlyList<WorkoutHistoryOut>>
{
    internal sealed class Handler(IWorkoutHistoryRepository repository)
        : IRequestHandler<ListWorkoutHistoryQuery, IReadOnlyList<WorkoutHistoryOut>>
    {
        public async Task<IReadOnlyList<WorkoutHistoryOut>> Handle(
            ListWorkoutHistoryQuery request, CancellationToken cancellationToken)
        {
            var all = await repository.ListAsync(cancellationToken);
            return all
                .Where(h => h.CurrentUserId == request.CurrentUserId)
                .Where(h => request.From == null || string.Compare(h.StartedAt, request.From, StringComparison.Ordinal) >= 0)
                .Where(h => request.To == null || string.Compare(h.StartedAt, request.To, StringComparison.Ordinal) <= 0)
                .OrderByDescending(h => h.StartedAt)
                .Select(MapToOut)
                .ToList();
        }

        internal static WorkoutHistoryOut MapToOut(Domain.Entities.WorkoutHistory h) =>
            new(
                h.Id,
                h.CurrentUserId,
                h.Mode,
                h.StartedAt,
                h.CompletedAt,
                h.DurationSeconds,
                h.TotalSets,
                h.CompletedSets,
                h.Exercises.Select(e => new CompletedRoutineExcercise(
                    e.Name,
                    e.ActivityType,
                    e.ActivityTrackType,
                    e.Sets.Select(s => new CompletedRoutineSet(
                        s.Type, s.Reps, s.Duration, s.Distance, s.Weight, s.Notes, s.Completed
                    )).ToList()
                )).ToList(),
                h.SourceWorkout is not null
                    ? new CompletedSourceWorkout(h.SourceWorkout.WorkoutId, h.SourceWorkout.Name, h.SourceWorkout.Date)
                    : new CompletedSourceWorkout(string.Empty, string.Empty, string.Empty)
            );
    }
}
