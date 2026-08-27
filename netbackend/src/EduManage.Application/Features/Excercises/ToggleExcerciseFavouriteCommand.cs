using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record ToggleExcerciseFavouriteCommand(int ExerciseId, string CurrentUserId) : IRequest;

internal sealed class ToggleExcerciseFavouriteHandler(
    IExerciseRepository exerciseRepository,
    IUserExercisePreferenceRepository prefRepository)
    : IRequestHandler<ToggleExcerciseFavouriteCommand>
{
    public async Task Handle(ToggleExcerciseFavouriteCommand request, CancellationToken cancellationToken)
    {
        var exercise = await exerciseRepository.GetByIdAsync(request.ExerciseId, cancellationToken)
            ?? throw new NotFoundException($"Exercise '{request.ExerciseId}' was not found.");

        await prefRepository.UpsertAsync(
            request.CurrentUserId,
            exercise.Id,
            pref => pref.IsDirectFavourite = !pref.IsDirectFavourite);
    }
}
