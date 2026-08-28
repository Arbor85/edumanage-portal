using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IOrganizationMembershipRepository : IRepository<OrganizationMembership, string>
{
    Task<IReadOnlyList<OrganizationMembership>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken);
    Task<OrganizationMembership?> GetByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken);
    Task DeleteByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<OrganizationMembership>> ListByTrainerAsync(string trainerUserId, CancellationToken cancellationToken);
}
