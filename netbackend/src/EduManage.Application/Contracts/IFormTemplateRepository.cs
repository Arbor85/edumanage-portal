using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IFormTemplateRepository : IRepository<FormTemplate, string>
{
    Task<IReadOnlyList<FormTemplate>> ListByTrainerAsync(string trainerUserId, CancellationToken cancellationToken);
}
