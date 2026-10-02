using EduManage.Application.Contracts;
using EduManage.Application.Features.Excercises;
using EduManage.Domain.Entities;
using NSubstitute;

namespace EduManage.Application.Tests.Exercises;

public sealed class ListExercisesQueryTests
{
    [Fact]
    public async Task Handle_ReturnsAllExercisesWithDefaultPreferenceValues()
    {
        var exercise = new Exercise { Id = 1, Name = "Squat", PrimaryMuscle = "Quads" };
        var exerciseRepository = Substitute.For<IExerciseRepository>();
        exerciseRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([exercise]);
        var prefRepository = Substitute.For<IUserExercisePreferenceRepository>();

        var handler = new ListExcercisesQuery.Handler(exerciseRepository, prefRepository);
        var result = await handler.Handle(new ListExcercisesQuery(), default);

        Assert.Single(result);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Squat", result[0].Name);
        Assert.False(result[0].IsDirectFavourite);
        Assert.Equal(0, result[0].UsageCount);
        await prefRepository.DidNotReceive().GetByUserIdAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task Handle_AppliesUserPreferencesWhenUserIdProvided()
    {
        var userId = "user-1";
        var exercise = new Exercise { Id = 1, Name = "Squat", PrimaryMuscle = "Quads" };
        var pref = new UserExercisePreference { UserId = userId, ExerciseId = 1, IsDirectFavourite = true, UsageCount = 5 };
        var exerciseRepository = Substitute.For<IExerciseRepository>();
        exerciseRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([exercise]);
        var prefRepository = Substitute.For<IUserExercisePreferenceRepository>();
        prefRepository.GetByUserIdAsync(userId).Returns([pref]);

        var handler = new ListExcercisesQuery.Handler(exerciseRepository, prefRepository);
        var result = await handler.Handle(new ListExcercisesQuery(userId), default);

        Assert.Single(result);
        Assert.True(result[0].IsDirectFavourite);
        Assert.Equal(5, result[0].UsageCount);
    }

    [Fact]
    public async Task Handle_UsesDefaultPreferencesForExercisesWithNoUserPref()
    {
        var userId = "user-1";
        var exercise1 = new Exercise { Id = 1, Name = "Squat", PrimaryMuscle = "Quads" };
        var exercise2 = new Exercise { Id = 2, Name = "Bench Press", PrimaryMuscle = "Chest" };
        var pref = new UserExercisePreference { UserId = userId, ExerciseId = 1, IsDirectFavourite = true, UsageCount = 3 };
        var exerciseRepository = Substitute.For<IExerciseRepository>();
        exerciseRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([exercise1, exercise2]);
        var prefRepository = Substitute.For<IUserExercisePreferenceRepository>();
        prefRepository.GetByUserIdAsync(userId).Returns([pref]);

        var handler = new ListExcercisesQuery.Handler(exerciseRepository, prefRepository);
        var result = await handler.Handle(new ListExcercisesQuery(userId), default);

        Assert.Equal(2, result.Count);
        Assert.True(result[0].IsDirectFavourite);
        Assert.False(result[1].IsDirectFavourite);
        Assert.Equal(0, result[1].UsageCount);
    }
}
