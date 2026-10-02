using EduManage.Application.Contracts;
using EduManage.Application.Features.Clients;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Clients;

public sealed class AddClientCommandTests
{
    [Fact]
    public async Task Handle_CreatesClientAndReturnsOut()
    {
        var trainerId = "trainer-1";
        var repository = Substitute.For<IClientRepository>();
        repository.AddAsync(Arg.Any<Client>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Client>());

        var handler = new AddClientCommand.Handler(repository);
        var result = await handler.Handle(
            new AddClientCommand(new ClientCreate("Alice", ["tag1"]), trainerId), default);

        Assert.Equal("Alice", result.Name);
        Assert.Equal(trainerId, result.TrainerUserId);
        Assert.Equal("Invited", result.Status);
        Assert.Matches(@"^CLI-[A-Z]+-\d[A-Z0-9]+-\d{4}$", result.InvitationCode);
        await repository.Received(1).AddAsync(Arg.Any<Client>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PassesTagsToClient()
    {
        var repository = Substitute.For<IClientRepository>();
        repository.AddAsync(Arg.Any<Client>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Client>());

        var handler = new AddClientCommand.Handler(repository);
        var result = await handler.Handle(
            new AddClientCommand(new ClientCreate("Bob", ["strength", "cardio"]), "trainer-2"), default);

        Assert.Equal(["strength", "cardio"], result.Tags);
    }
}
