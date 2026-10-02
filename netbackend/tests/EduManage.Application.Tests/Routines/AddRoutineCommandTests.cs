using EduManage.Application.Contracts;
using EduManage.Application.Features.Routines;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Routines;

public sealed class AddRoutineCommandTests
{
    [Fact]
    public async Task Handle_CreatesRoutineWithCorrectProperties()
    {
        var userId = "user-1";
        var routineRepository = Substitute.For<IRoutineRepository>();
        routineRepository.AddAsync(Arg.Any<Routine>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Routine>());
        var prefRepository = Substitute.For<IUserExercisePreferenceRepository>();

        var exercises = new List<RoutineExcercise>
        {
            new("Squat", ActivityType.Weighted, ActivityTrackType.Repetitions,
                [new EduManage.Application.Contracts.RoutineSet("Normal", 10, null, null, 80.0, null)])
        };

        var handler = new AddRoutineCommand.Handler(routineRepository, prefRepository);
        var result = await handler.Handle(
            new AddRoutineCommand(new RoutineCreate("Leg Day", "Focus on form", exercises), userId), default);

        Assert.Equal("Leg Day", result.Name);
        Assert.Equal("Focus on form", result.Note);
        Assert.Equal(userId, result.UserId);
        Assert.Single(result.Excercises);
        Assert.Equal("Squat", result.Excercises[0].Name);
    }

    [Fact]
    public async Task Handle_UpsertsPreferencesForExercisesWithId()
    {
        var userId = "user-1";
        var routineRepository = Substitute.For<IRoutineRepository>();
        routineRepository.AddAsync(Arg.Any<Routine>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Routine>());
        var prefRepository = Substitute.For<IUserExercisePreferenceRepository>();

        var exercises = new List<RoutineExcercise>
        {
            new("Squat", ActivityType.Weighted, ActivityTrackType.Repetitions, [], ExerciseId: 42),
            new("Run", ActivityType.Cardio, ActivityTrackType.Time, [])
        };

        var handler = new AddRoutineCommand.Handler(routineRepository, prefRepository);
        await handler.Handle(
            new AddRoutineCommand(new RoutineCreate("Mixed", null, exercises), userId), default);

        await prefRepository.Received(1)
            .UpsertAsync(userId, 42, Arg.Any<Action<UserExercisePreference>>());
        await prefRepository.DidNotReceive()
            .UpsertAsync(userId, 0, Arg.Any<Action<UserExercisePreference>>());
    }
}
