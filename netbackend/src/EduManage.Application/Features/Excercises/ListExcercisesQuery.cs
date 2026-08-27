using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record ListExcercisesQuery(string? CurrentUserId = null) : IRequest<IReadOnlyList<ExcerciseOut>>
{
    internal sealed class Handler(
        IExerciseRepository repository,
        IUserExercisePreferenceRepository prefRepository)
        : IRequestHandler<ListExcercisesQuery, IReadOnlyList<ExcerciseOut>>
    {
        public async Task<IReadOnlyList<ExcerciseOut>> Handle(ListExcercisesQuery request, CancellationToken cancellationToken)
        {
            var exercises = await repository.ListAsync(cancellationToken);

            Dictionary<int, UserExercisePreference> prefLookup = [];
            if (request.CurrentUserId is not null)
            {
                var prefs = await prefRepository.GetByUserIdAsync(request.CurrentUserId);
                prefLookup = prefs.ToDictionary(p => p.ExerciseId);
            }

            return exercises.Select(e => ToOut(e, prefLookup.GetValueOrDefault(e.Id))).ToList();
        }

        internal static ExcerciseOut ToOut(Exercise e, UserExercisePreference? pref) =>
            new(
                e.Id,
                e.Name,
                e.ShortDescription,
                e.PrimaryMuscle,
                e.SecondaryMuscles,
                e.Muscles,
                e.Tags,
                e.ActivityType,
                e.ActivityTrackType,
                e.Instructions,
                e.Equipment,
                e.Level,
                e.Force,
                e.Mechanic,
                e.Category,
                e.ImagePath,
                e.GifPath,
                e.DatasetId,
                pref?.IsDirectFavourite ?? false,
                pref?.UsageCount ?? 0);
    }
}
