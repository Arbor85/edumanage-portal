using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record AddExcerciseCommand(ExcerciseWriteRequest Request) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<AddExcerciseCommand, ExcerciseOut>
    {
        public Task<ExcerciseOut> Handle(AddExcerciseCommand request, CancellationToken cancellationToken) =>
            repository.AddExcerciseAsync(request.Request, cancellationToken);
    }
}