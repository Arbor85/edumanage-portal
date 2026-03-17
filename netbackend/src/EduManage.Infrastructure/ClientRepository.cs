using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class ClientRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), IClientRepository
{
    public Task<IReadOnlyList<ClientOut>> ListClientsAsync(CancellationToken cancellationToken)
    {
        return ListAsync<ClientOut>(RepositoryCategories.Clients, cancellationToken);
    }

    public async Task<ClientOut> AddClientAsync(ClientCreate request, CancellationToken cancellationToken)
    {
        var invitationCode = string.IsNullOrWhiteSpace(request.InvitationCode) ? NewId()[..8] : request.InvitationCode;
        var client = new ClientOut(request.Name, request.Tags, request.ImageUrl, request.Status, invitationCode, null, null);
        await SaveAsync(RepositoryCategories.Clients, invitationCode, client, cancellationToken);
        return client;
    }

    public async Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, CancellationToken cancellationToken)
    {
        var existing = await FindAsync<ClientOut>(RepositoryCategories.Clients, invitationCode, cancellationToken);
        if (existing is null)
        {
            throw new NotFoundException($"Client '{invitationCode}' was not found.");
        }

        var updated = new ClientOut(request.Name, request.Tags, request.ImageUrl, request.Status, request.InvitationCode, existing.UserId, existing.CurrentUserId);

        if (!string.Equals(invitationCode, updated.InvitationCode, StringComparison.Ordinal))
        {
            await DeleteAsync(RepositoryCategories.Clients, invitationCode, cancellationToken);
        }

        await SaveAsync(RepositoryCategories.Clients, updated.InvitationCode, updated, cancellationToken);
        return updated;
    }

    public async Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, CancellationToken cancellationToken)
    {
        var deleted = await DeleteAsync(RepositoryCategories.Clients, invitationCode, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Client '{invitationCode}' was not found.");
        }

        return new Dictionary<string, string> { ["detail"] = "Client deleted" };
    }

    public async Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, CancellationToken cancellationToken)
    {
        var existing = await FindAsync<ClientOut>(RepositoryCategories.Clients, invitationCode, cancellationToken);
        if (existing is null)
        {
            throw new NotFoundException($"Client '{invitationCode}' was not found.");
        }

        var updated = existing with
        {
            Name = request.Name,
            ImageUrl = request.ImageUrl,
            Status = "Active",
            UserId = request.Email
        };

        await SaveAsync(RepositoryCategories.Clients, invitationCode, updated, cancellationToken);
        return updated;
    }
}
