using EduManage.Application.Contracts;
using EduManage.Application.Features.Clients;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Clients;

public sealed class ListClientsQueryTests
{
    [Fact]
    public async Task Handle_ReturnsOnlyClientsForRequestingTrainer()
    {
        var trainerId = "trainer-1";
        var ownClient = new Client("CLI-ACE-1A-0001", "Alice", trainerId, ["fitness"]);
        var otherClient = new Client("CLI-ACE-2B-0002", "Bob", "other-trainer", []);
        var repository = Substitute.For<IClientRepository>();
        repository.ListAsync(Arg.Any<CancellationToken>()).Returns([ownClient, otherClient]);

        var handler = new ListClientsQuery.Handler(repository);
        var result = await handler.Handle(new ListClientsQuery(trainerId), default);

        Assert.Single(result);
        Assert.Equal("Alice", result[0].Name);
        Assert.Equal(trainerId, result[0].TrainerUserId);
    }

    [Fact]
    public async Task Handle_ReturnsEmptyWhenNoMatchingClients()
    {
        var repository = Substitute.For<IClientRepository>();
        repository.ListAsync(Arg.Any<CancellationToken>()).Returns([]);

        var handler = new ListClientsQuery.Handler(repository);
        var result = await handler.Handle(new ListClientsQuery("trainer-1"), default);

        Assert.Empty(result);
    }
}
