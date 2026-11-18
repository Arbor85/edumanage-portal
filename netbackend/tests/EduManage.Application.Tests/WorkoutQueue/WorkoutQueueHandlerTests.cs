using EduManage.Application.Contracts;
using EduManage.Application.Features.WorkoutQueue;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.WorkoutQueue;

public sealed class WorkoutQueueHandlerTests
{
    [Fact]
    public async Task Add_PersistsEntityScopedToCurrentUser()
    {
        var repo = Substitute.For<IQueuedWorkoutRepository>();
        var handler = new AddQueuedWorkoutCommand.Handler(repo);

        var result = await handler.Handle(
            new AddQueuedWorkoutCommand(new QueuedWorkoutCreate("routine-1", "ha"), "user-1"),
            default);

        Assert.Equal("routine-1", result.RoutineId);
        Assert.Equal("ha", result.Source);
        await repo.Received(1).AddAsync(Arg.Is<QueuedWorkout>(q => q.UserId == "user-1" && q.RoutineId == "routine-1"), default);
    }

    [Fact]
    public async Task Add_DefaultsSourceToApiWhenMissing()
    {
        var repo = Substitute.For<IQueuedWorkoutRepository>();
        var handler = new AddQueuedWorkoutCommand.Handler(repo);

        var result = await handler.Handle(
            new AddQueuedWorkoutCommand(new QueuedWorkoutCreate("routine-1", null), "user-1"),
            default);

        Assert.Equal("api", result.Source);
    }

    [Fact]
    public async Task List_ReturnsOnlyUsersItems()
    {
        var repo = Substitute.For<IQueuedWorkoutRepository>();
        repo.ListForUserAsync("user-1", Arg.Any<CancellationToken>()).Returns(new List<QueuedWorkout>
        {
            new() { Id = "q1", UserId = "user-1", RoutineId = "r1", CreatedAt = "2026-11-18T10:00:00Z", Source = "ha" },
        });
        var handler = new ListQueuedWorkoutsQuery.Handler(repo);

        var result = await handler.Handle(new ListQueuedWorkoutsQuery("user-1"), default);

        Assert.Single(result);
        Assert.Equal("q1", result[0].Id);
    }

    [Fact]
    public async Task Delete_DelegatesScopedByUser()
    {
        var repo = Substitute.For<IQueuedWorkoutRepository>();
        repo.DeleteForUserAsync("q1", "user-1", Arg.Any<CancellationToken>()).Returns(true);
        var handler = new DeleteQueuedWorkoutCommand.Handler(repo);

        var result = await handler.Handle(new DeleteQueuedWorkoutCommand("q1", "user-1"), default);

        Assert.True(result);
        await repo.Received(1).DeleteForUserAsync("q1", "user-1", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Delete_ReturnsFalseWhenNothingDeleted()
    {
        var repo = Substitute.For<IQueuedWorkoutRepository>();
        repo.DeleteForUserAsync("q1", "user-1", Arg.Any<CancellationToken>()).Returns(false);
        var handler = new DeleteQueuedWorkoutCommand.Handler(repo);

        var result = await handler.Handle(new DeleteQueuedWorkoutCommand("q1", "user-1"), default);

        Assert.False(result);
    }
}
