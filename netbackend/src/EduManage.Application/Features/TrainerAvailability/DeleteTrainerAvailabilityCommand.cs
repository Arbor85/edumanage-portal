using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.TrainerAvailability;

public sealed record DeleteTrainerAvailabilityCommand(string AvailabilityId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(ITrainerAvailabilityRepository repo) : IRequestHandler<DeleteTrainerAvailabilityCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteTrainerAvailabilityCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.AvailabilityId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
