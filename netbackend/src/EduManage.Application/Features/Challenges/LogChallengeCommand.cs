using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Challenges;

public sealed record LogChallengeCommand(string UserId) : IRequest
{
    internal sealed class Handler(IUserChallengeLogRepository logRepository)
        : IRequestHandler<LogChallengeCommand>
    {
        public async Task Handle(LogChallengeCommand request, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var already = await logRepository.ExistsAsync(request.UserId, today, cancellationToken);
            if (!already)
                await logRepository.LogAsync(request.UserId, today, cancellationToken);
        }
    }
}
