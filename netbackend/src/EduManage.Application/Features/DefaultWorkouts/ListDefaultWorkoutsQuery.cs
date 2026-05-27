using EduManage.Application.Contracts;
using MediatR;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;

namespace EduManage.Application.Features.DefaultWorkouts;

public sealed record ListDefaultWorkoutsQuery : IRequest<IReadOnlyList<DefaultWorkoutOut>>
{
    internal sealed class Handler(IDefaultWorkoutRepository repository)
        : IRequestHandler<ListDefaultWorkoutsQuery, IReadOnlyList<DefaultWorkoutOut>>
    {
        public async Task<IReadOnlyList<DefaultWorkoutOut>> Handle(ListDefaultWorkoutsQuery request, CancellationToken cancellationToken)
        {
            var defaultWorkouts = await repository.ListAsync(cancellationToken);
            return defaultWorkouts.Select(ToOut).ToList();
        }

        internal static DefaultWorkoutOut ToOut(EduManage.Domain.Entities.DefaultWorkout defaultWorkout) =>
            new(
                defaultWorkout.Id,
                defaultWorkout.Name,
                defaultWorkout.Notes,
                defaultWorkout.Exercises.Select(defaultWorkoutExercise => new RoutineExcercise(
                    defaultWorkoutExercise.Name,
                    defaultWorkoutExercise.ActivityType,
                    defaultWorkoutExercise.ActivityTrackType,
                    defaultWorkoutExercise.Sets.Select(defaultWorkoutSet => new ContractsRoutineSet(
                        defaultWorkoutSet.Type,
                        defaultWorkoutSet.Reps,
                        defaultWorkoutSet.Duration,
                        defaultWorkoutSet.Distance,
                        defaultWorkoutSet.Weight,
                        defaultWorkoutSet.Notes)).ToList())).ToList());
    }
}
