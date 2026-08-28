using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class OrganizationMembershipRepository(EduManageDbContext context)
    : BaseRepository<OrganizationMembership, string>(context), IOrganizationMembershipRepository
{
    public async Task<IReadOnlyList<OrganizationMembership>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken) =>
        await Context.OrganizationMemberships.Where(m => m.OrganizationId == organizationId).ToListAsync(cancellationToken);

    public async Task<OrganizationMembership?> GetByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken) =>
        await Context.OrganizationMemberships.FirstOrDefaultAsync(m => m.TrainerUserId == trainerUserId && m.OrganizationId == organizationId, cancellationToken);

    public async Task DeleteByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken)
    {
        var membership = await Context.OrganizationMemberships
            .FirstOrDefaultAsync(m => m.TrainerUserId == trainerUserId && m.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException($"Trainer '{trainerUserId}' is not a member of this organization.");
        Context.OrganizationMemberships.Remove(membership);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<OrganizationMembership>> ListByTrainerAsync(string trainerUserId, CancellationToken cancellationToken) =>
        await Context.OrganizationMemberships.Where(m => m.TrainerUserId == trainerUserId).ToListAsync(cancellationToken);
}
