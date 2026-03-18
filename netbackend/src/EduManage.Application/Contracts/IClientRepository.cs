namespace EduManage.Application.Contracts;

/// <summary>
/// Repository for managing client entities scoped to the current user.
/// </summary>
public interface IClientRepository
{
    /// <summary>
    /// Lists all clients for the specified user.
    /// </summary>
    /// <param name="userId">The current user identifier.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A read-only list of clients owned by the user.</returns>
    Task<IReadOnlyList<ClientOut>> ListClientsAsync(string? userId, CancellationToken cancellationToken);

    /// <summary>
    /// Adds a new client for the specified user.
    /// </summary>
    /// <param name="request">The client create request.</param>
    /// <param name="userId">The current user identifier who creates the client.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created client.</returns>
    Task<ClientOut> AddClientAsync(ClientCreate request, string? userId, CancellationToken cancellationToken);

    /// <summary>
    /// Edits a client for the specified user.
    /// </summary>
    /// <param name="invitationCode">The client invitation code.</param>
    /// <param name="request">The client update request.</param>
    /// <param name="userId">The current user identifier.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated client.</returns>
    Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, string? userId, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a client for the specified user.
    /// </summary>
    /// <param name="invitationCode">The client invitation code.</param>
    /// <param name="userId">The current user identifier.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A dictionary with the deletion result.</returns>
    Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, string? userId, CancellationToken cancellationToken);

    /// <summary>
    /// Accepts a client invitation and associates it with the specified user.
    /// </summary>
    /// <param name="invitationCode">The client invitation code.</param>
    /// <param name="request">The accept invitation request.</param>
    /// <param name="userId">The current user identifier who accepts the invitation.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated client.</returns>
    Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, string? userId, CancellationToken cancellationToken);
}
