using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record GetExcerciseQuery(int Id) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<GetExcerciseQuery, ExcerciseOut>
    {
        public async Task<ExcerciseOut> Handle(GetExcerciseQuery request, CancellationToken cancellationToken)
        {
            var exercise = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Excercise '{request.Id}' was not found.");

            return ListExcercisesQuery.Handler.ToOut(exercise);
        }
    }
}
