using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IClientRepository : IRepository<Client, string>
{
    Task<Client?> GetByCodeAsync(string code, CancellationToken cancellationToken);
}
