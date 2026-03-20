using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ClientRepository(EduManageDbContext context)
    : BaseRepository<Client, string>(context), IClientRepository
{
    public async Task<Client?> GetByCodeAsync(string code, CancellationToken cancellationToken)
    {
        return await Context.Clients.FirstOrDefaultAsync(c => c.InvitationCode == code, cancellationToken);
    }
}

