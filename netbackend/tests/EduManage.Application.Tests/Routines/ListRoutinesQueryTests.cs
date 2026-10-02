using EduManage.Application.Contracts;
using EduManage.Application.Features.Routines;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Routines;

public sealed class ListRoutinesQueryTests
{
    [Fact]
    public async Task Handle_ReturnsOnlyRoutinesForCurrentUser()
    {
        var userId = "user-1";
        var ownRoutine = new Routine { Id = "r1", Name = "Leg Day", UserId = userId };
        var otherRoutine = new Routine { Id = "r2", Name = "Push Day", UserId = "other-user" };
        var repository = Substitute.For<IRoutineRepository>();
        repository.Enumerate.Returns(new[] { ownRoutine, otherRoutine }.ToAsyncEnumerable());

        var handler = new ListRoutinesQuery.Handler(repository);
        var result = await handler.Handle(new ListRoutinesQuery(userId), default);

        Assert.Single(result);
        Assert.Equal("Leg Day", result[0].Name);
        Assert.Equal(userId, result[0].UserId);
    }

    [Fact]
    public async Task Handle_ReturnsEmptyWhenNoRoutinesForUser()
    {
        var repository = Substitute.For<IRoutineRepository>();
        repository.Enumerate.Returns(Array.Empty<Routine>().ToAsyncEnumerable());

        var handler = new ListRoutinesQuery.Handler(repository);
        var result = await handler.Handle(new ListRoutinesQuery("user-1"), default);

        Assert.Empty(result);
    }
}
