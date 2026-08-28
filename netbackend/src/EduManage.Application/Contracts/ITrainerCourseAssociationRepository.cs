using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface ITrainerCourseAssociationRepository : IRepository<TrainerCourseAssociation, string>
{
    Task<IReadOnlyList<TrainerCourseAssociation>> ListByOrganizationAsync(string organizationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<TrainerCourseAssociation>> ListByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken);
}
