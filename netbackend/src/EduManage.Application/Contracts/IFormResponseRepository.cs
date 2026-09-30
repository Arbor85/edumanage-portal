using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IFormResponseRepository : IRepository<FormResponse, string>
{
    Task<IReadOnlyList<FormResponse>> ListByClientAsync(string clientId, CancellationToken cancellationToken);
}
