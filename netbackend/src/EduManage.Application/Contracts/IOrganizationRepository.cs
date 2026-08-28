using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IOrganizationRepository : IRepository<Organization, string>
{
    Task<Organization?> GetByOwnerIdAsync(string ownerId, CancellationToken cancellationToken);
    Task<Organization?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken);
}
