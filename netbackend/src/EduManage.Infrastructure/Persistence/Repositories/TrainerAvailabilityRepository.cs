using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class TrainerAvailabilityRepository(EduManageDbContext context)
    : BaseRepository<TrainerAvailability, string>(context), ITrainerAvailabilityRepository
{
    public async Task<IReadOnlyList<TrainerAvailability>> ListByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken) =>
        await Context.TrainerAvailabilities
            .Where(a => a.TrainerUserId == trainerUserId && a.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TrainerAvailability>> ListByOrgAsync(string organizationId, CancellationToken cancellationToken) =>
        await Context.TrainerAvailabilities
            .Where(a => a.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
}
