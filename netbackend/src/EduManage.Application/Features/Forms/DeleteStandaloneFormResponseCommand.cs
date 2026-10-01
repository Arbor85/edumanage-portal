using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record DeleteStandaloneFormResponseCommand(string ResponseId, string TrainerUserId) : IRequest
{
    internal sealed class Handler(IStandaloneFormResponseRepository responseRepository) : IRequestHandler<DeleteStandaloneFormResponseCommand>
    {
        public async Task Handle(DeleteStandaloneFormResponseCommand request, CancellationToken cancellationToken)
        {
            var response = await responseRepository.GetByIdAsync(request.ResponseId, cancellationToken)
                ?? throw new NotFoundException($"Response '{request.ResponseId}' was not found.");

            if (response.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException("You do not have permission to delete this response.");

            await responseRepository.DeleteByIdAsync(request.ResponseId, cancellationToken);
        }
    }
}
