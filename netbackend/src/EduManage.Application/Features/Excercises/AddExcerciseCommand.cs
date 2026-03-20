using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record AddExcerciseCommand(ExcerciseWriteRequest Request) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<AddExcerciseCommand, ExcerciseOut>
    {
        public async Task<ExcerciseOut> Handle(AddExcerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = new Exercise
            {
                Name = request.Request.Name,
                ShortDescription = request.Request.ShortDescription ?? string.Empty,
                PrimaryMuscle = request.Request.PrimaryMuscle,
                SecondaryMuscles = NormalizeSecondaryMuscles(request.Request.PrimaryMuscle, request.Request.SecondaryMuscles),
                Muscles = [],
                Tags = request.Request.Tags?.ToList() ?? []
            };

            await repository.AddAsync(exercise, cancellationToken);
            return ListExcercisesQuery.Handler.ToOut(exercise);
        }

        internal static List<string> NormalizeSecondaryMuscles(string primaryMuscle, IReadOnlyList<string>? secondaryMuscles)
        {
            if (secondaryMuscles is null) return [];
            var comparer = StringComparer.OrdinalIgnoreCase;
            var result = new List<string>();
            foreach (var muscle in secondaryMuscles)
            {
                if (string.IsNullOrWhiteSpace(muscle)) continue;
                if (comparer.Equals(muscle, primaryMuscle)) continue;
                if (result.Any(existing => comparer.Equals(existing, muscle))) continue;
                result.Add(muscle);
            }
            return result;
        }
    }
}