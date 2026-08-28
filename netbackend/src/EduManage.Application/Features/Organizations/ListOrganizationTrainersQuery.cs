using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record ListOrganizationTrainersQuery(string OwnerId) : IRequest<IReadOnlyList<OrganizationMemberOut>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, IOrganizationMembershipRepository memberRepo)
        : IRequestHandler<ListOrganizationTrainersQuery, IReadOnlyList<OrganizationMemberOut>>
    {
        public async Task<IReadOnlyList<OrganizationMemberOut>> Handle(ListOrganizationTrainersQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var members = await memberRepo.ListByOrganizationAsync(org.Id, cancellationToken);
            return members.Select(m => new OrganizationMemberOut(m.TrainerUserId, m.JoinedAt)).ToList();
        }
    }
}
