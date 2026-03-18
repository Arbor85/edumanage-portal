using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Excercises;

public sealed record UpdateExcerciseCommand(int Id, ExcerciseWriteRequest Request) : IRequest<ExcerciseOut>
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<UpdateExcerciseCommand, ExcerciseOut>
    {
        public Task<ExcerciseOut> Handle(UpdateExcerciseCommand request, CancellationToken cancellationToken) =>
            repository.UpdateExcerciseAsync(request.Id, request.Request, cancellationToken);
    }
}