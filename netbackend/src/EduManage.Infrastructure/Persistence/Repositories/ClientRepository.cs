using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class ClientRepository : IClientRepository
{
    private readonly EduManageDbContext _context;

    public ClientRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ClientOut>> ListClientsAsync(string? userId, CancellationToken cancellationToken)
    {
        var clients = await _context.Clients
            .Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);
        return clients.Select(c => new ClientOut(c.Name, c.Tags, c.ImageUrl, c.Status, c.InvitationCode, c.UserId, null)).ToList();
    }

    public async Task<ClientOut> AddClientAsync(ClientCreate request, string? userId, CancellationToken cancellationToken)
    {
        var invitationCode = string.IsNullOrWhiteSpace(request.InvitationCode)
            ? Guid.NewGuid().ToString("N")[..8]
            : request.InvitationCode;

        var client = new Client
        {
            InvitationCode = invitationCode,
            Name = request.Name,
            Tags = request.Tags.ToList(),
            ImageUrl = request.ImageUrl,
            Status = request.Status,
            UserId = userId
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }

    public async Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, string? userId, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        if (client.UserId != userId)
            throw new UnauthorizedAccessException($"You do not have permission to edit client '{invitationCode}'.");

        client.Name = request.Name;
        client.Tags = request.Tags.ToList();
        client.ImageUrl = request.ImageUrl;
        client.Status = request.Status;
        client.InvitationCode = request.InvitationCode;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }

    public async Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, string? userId, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        if (client.UserId != userId)
            throw new UnauthorizedAccessException($"You do not have permission to delete client '{invitationCode}'.");

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Client deleted" };
    }

    public async Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, string? userId, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        client.Name = request.Name;
        client.ImageUrl = request.ImageUrl;
        client.Status = "Active";
        client.UserId = request.Email;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }
}
