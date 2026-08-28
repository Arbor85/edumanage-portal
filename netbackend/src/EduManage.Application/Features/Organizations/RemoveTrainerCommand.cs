using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record RemoveTrainerCommand(string OwnerId, string TrainerUserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IOrganizationMembershipRepository memberRepo)
        : IRequestHandler<RemoveTrainerCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(RemoveTrainerCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            await memberRepo.DeleteByTrainerAndOrgAsync(request.TrainerUserId, org.Id, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Trainer removed." };
        }
    }
}
