using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Clients;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Clients;

public sealed class DeleteClientCommandTests
{
    private const string InvitationCode = "CLI-ACE-1A-0001";

    [Fact]
    public async Task Handle_DeletesClientAndReturnsConfirmation()
    {
        var trainerId = "trainer-1";
        var client = new Client(InvitationCode, "Alice", trainerId, []);
        var repository = Substitute.For<IClientRepository>();
        repository.GetByIdAsync(InvitationCode, Arg.Any<CancellationToken>()).Returns(client);

        var handler = new DeleteClientCommand.Handler(repository);
        var result = await handler.Handle(new DeleteClientCommand(InvitationCode, trainerId), default);

        Assert.Equal("Client deleted", result["detail"]);
        await repository.Received(1).DeleteByIdAsync(InvitationCode, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedWhenCallerIsNotOwner()
    {
        var client = new Client(InvitationCode, "Alice", "trainer-1", []);
        var repository = Substitute.For<IClientRepository>();
        repository.GetByIdAsync(InvitationCode, Arg.Any<CancellationToken>()).Returns(client);

        var handler = new DeleteClientCommand.Handler(repository);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => handler.Handle(new DeleteClientCommand(InvitationCode, "attacker"), default));
    }

    [Fact]
    public async Task Handle_ThrowsNotFoundWhenClientDoesNotExist()
    {
        var repository = Substitute.For<IClientRepository>();
        repository.GetByIdAsync(InvitationCode, Arg.Any<CancellationToken>()).Returns((Client?)null);

        var handler = new DeleteClientCommand.Handler(repository);
        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(new DeleteClientCommand(InvitationCode, "trainer-1"), default));
    }
}
