using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class OrganizationRepository(EduManageDbContext context)
    : BaseRepository<Organization, string>(context), IOrganizationRepository
{
    public async Task<Organization?> GetByOwnerIdAsync(string ownerId, CancellationToken cancellationToken) =>
        await Context.Organizations.FirstOrDefaultAsync(o => o.OwnerId == ownerId, cancellationToken);

    public async Task<Organization?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken) =>
        await Context.Organizations.FirstOrDefaultAsync(o => o.InviteCode == inviteCode, cancellationToken);
}
