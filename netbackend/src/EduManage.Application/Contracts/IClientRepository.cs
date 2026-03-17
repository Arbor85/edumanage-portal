namespace EduManage.Application.Contracts;

public interface IClientRepository
{
    Task<IReadOnlyList<ClientOut>> ListClientsAsync(CancellationToken cancellationToken);
    Task<ClientOut> AddClientAsync(ClientCreate request, CancellationToken cancellationToken);
    Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, CancellationToken cancellationToken);
    Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, CancellationToken cancellationToken);
}
