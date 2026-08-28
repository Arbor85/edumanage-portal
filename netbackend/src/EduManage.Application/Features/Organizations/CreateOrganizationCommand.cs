using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record CreateOrganizationCommand(string OwnerId, OrganizationCreate Request) : IRequest<OrganizationOut>
{
    internal sealed class Handler(IOrganizationRepository repository) : IRequestHandler<CreateOrganizationCommand, OrganizationOut>
    {
        public async Task<OrganizationOut> Handle(CreateOrganizationCommand request, CancellationToken cancellationToken)
        {
            var org = new Organization
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                OwnerId = request.OwnerId,
                InviteCode = Guid.NewGuid().ToString("N")
            };
            await repository.AddAsync(org, cancellationToken);
            return new OrganizationOut(org.Id, org.Name, org.OwnerId, org.InviteCode, 0);
        }
    }
}
