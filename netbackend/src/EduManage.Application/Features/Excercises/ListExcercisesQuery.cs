using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record ListExcercisesQuery : IRequest<IReadOnlyList<ExcerciseOut>>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<ListExcercisesQuery, IReadOnlyList<ExcerciseOut>>
    {
        public async Task<IReadOnlyList<ExcerciseOut>> Handle(ListExcercisesQuery request, CancellationToken cancellationToken)
        {
            var exercises = await repository.ListAsync(cancellationToken);
            return exercises.Select(ToOut).ToList();
        }

        internal static ExcerciseOut ToOut(EduManage.Domain.Entities.Exercise e) =>
            new(e.Id, e.Name, e.ShortDescription, e.PrimaryMuscle, e.SecondaryMuscles, e.Muscles, e.Tags);
    }
}