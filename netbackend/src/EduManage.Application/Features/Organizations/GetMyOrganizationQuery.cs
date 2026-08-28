using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record GetMyOrganizationQuery(string OwnerId) : IRequest<OrganizationOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IOrganizationMembershipRepository memberRepo)
        : IRequestHandler<GetMyOrganizationQuery, OrganizationOut>
    {
        public async Task<OrganizationOut> Handle(GetMyOrganizationQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var members = await memberRepo.ListByOrganizationAsync(org.Id, cancellationToken);
            return new OrganizationOut(org.Id, org.Name, org.OwnerId, org.InviteCode, members.Count);
        }
    }
}
