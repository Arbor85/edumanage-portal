using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface ITrainerAvailabilityRepository : IRepository<TrainerAvailability, string>
{
    Task<IReadOnlyList<TrainerAvailability>> ListByTrainerAndOrgAsync(string trainerUserId, string organizationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<TrainerAvailability>> ListByOrgAsync(string organizationId, CancellationToken cancellationToken);
}
