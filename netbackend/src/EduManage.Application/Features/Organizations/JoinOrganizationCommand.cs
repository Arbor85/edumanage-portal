using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record JoinOrganizationCommand(string TrainerUserId, string InviteCode) : IRequest<OrganizationMemberOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IOrganizationMembershipRepository memberRepo)
        : IRequestHandler<JoinOrganizationCommand, OrganizationMemberOut>
    {
        public async Task<OrganizationMemberOut> Handle(JoinOrganizationCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByInviteCodeAsync(request.InviteCode, cancellationToken)
                ?? throw new NotFoundException("Invalid invite code.");

            var existing = await memberRepo.GetByTrainerAndOrgAsync(request.TrainerUserId, org.Id, cancellationToken);
            if (existing is not null)
                return new OrganizationMemberOut(existing.TrainerUserId, existing.JoinedAt);

            var membership = new OrganizationMembership
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                TrainerUserId = request.TrainerUserId,
                JoinedAt = DateTime.UtcNow.ToString("O")
            };
            await memberRepo.AddAsync(membership, cancellationToken);
            return new OrganizationMemberOut(membership.TrainerUserId, membership.JoinedAt);
        }
    }
}
