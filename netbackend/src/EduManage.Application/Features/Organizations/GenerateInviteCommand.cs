using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record GenerateInviteCommand(string OwnerId) : IRequest<OrganizationOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IOrganizationMembershipRepository memberRepo)
        : IRequestHandler<GenerateInviteCommand, OrganizationOut>
    {
        public async Task<OrganizationOut> Handle(GenerateInviteCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            org.InviteCode = Guid.NewGuid().ToString("N");
            await orgRepo.UpdateAsync(org, cancellationToken);
            var members = await memberRepo.ListByOrganizationAsync(org.Id, cancellationToken);
            return new OrganizationOut(org.Id, org.Name, org.OwnerId, org.InviteCode, members.Count);
        }
    }
}
