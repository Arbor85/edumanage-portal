using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IStandaloneFormResponseRepository : IRepository<StandaloneFormResponse, string>
{
    Task<IReadOnlyList<StandaloneFormResponse>> ListByTemplateAsync(string formTemplateId, string trainerUserId, CancellationToken cancellationToken);
}
