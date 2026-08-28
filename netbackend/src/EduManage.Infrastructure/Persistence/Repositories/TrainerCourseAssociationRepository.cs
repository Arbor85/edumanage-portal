using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class TrainerCourseAssociationRepository(EduManageDbContext context)
    : BaseRepository<TrainerCourseAssociation, string>(context), ITrainerCourseAssociationRepository
{
    public async Task<IReadOnlyList<TrainerCourseAssociation>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken) =>
        await Context.TrainerCourseAssociations.Where(a => a.OrganizationId == organizationId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TrainerCourseAssociation>> ListByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken) =>
        await Context.TrainerCourseAssociations
            .Where(a => a.TrainerUserId == trainerUserId && a.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
}
