using MediatR;
using EduManage.Application.Contracts;

namespace EduManage.Application.Features.Excercises;

public sealed record DeleteExcerciseCommand(int Id) : IRequest
{
    internal sealed class Handler(IExerciseRepository repository) : IRequestHandler<DeleteExcerciseCommand>
    {
        public async Task Handle(DeleteExcerciseCommand request, CancellationToken cancellationToken)
        {
            await repository.DeleteExcerciseAsync(request.Id, cancellationToken);
        }
    }
}