using EduManage.Application.Contracts;
using EduManage.Application.Features.Excercises;
using EduManage.Domain.Entities;
using MediatR;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace EduManage.Api.Mcp;

[McpServerToolType]
public sealed class ExerciseTools(ISender mediator)
{
    [McpServerTool]
    [Description("List all exercises in the exercise library. Returns id, name, description, primaryMuscle, tags, activityType, activityTrackType, equipment, level, force, mechanic, category.")]
    public Task<IReadOnlyList<ExcerciseOut>> ListExercises(CancellationToken ct) =>
        mediator.Send(new ListExcercisesQuery(), ct);

    [McpServerTool]
    [Description("Get a single exercise by its numeric ID.")]
    public Task<ExcerciseOut> GetExercise(
        [Description("Numeric exercise ID")] int id,
        CancellationToken ct) =>
        mediator.Send(new GetExcerciseQuery(id), ct);

    [McpServerTool]
    [Description("Create a new exercise in the library.")]
    public Task<ExcerciseOut> CreateExercise(
        [Description("Exercise name")] string name,
        [Description("Primary muscle group (e.g. chest, back, quads, hamstrings, glutes, shoulders, biceps, triceps, abs, calves, forearms, lats)")] string primaryMuscle,
        [Description("Short description of the exercise")] string? shortDescription = null,
        [Description("Activity type: weighted, machine, bodyweight, cardio")] string activityType = "weighted",
        [Description("How progress is tracked: repetitions, time, distance")] string activityTrackType = "repetitions",
        [Description("Required equipment (e.g. barbell, dumbbell, cable, bodyweight)")] string? equipment = null,
        [Description("Difficulty level: beginner, intermediate, advanced")] string? level = null,
        [Description("Force type: push, pull, static")] string? force = null,
        [Description("Mechanic: compound, isolation")] string? mechanic = null,
        [Description("Category (e.g. chest, back, legs, shoulders, arms, abs, cardio)")] string? category = null,
        CancellationToken ct = default) =>
        mediator.Send(new AddExcerciseCommand(new ExcerciseWriteRequest(
            name,
            shortDescription,
            primaryMuscle,
            null,
            null,
            ParseActivityType(activityType),
            ParseActivityTrackType(activityTrackType),
            null,
            equipment,
            level,
            force,
            mechanic,
            category)), ct);

    [McpServerTool]
    [Description("Update an existing exercise by ID.")]
    public Task<ExcerciseOut> UpdateExercise(
        [Description("Numeric exercise ID to update")] int id,
        [Description("New exercise name")] string name,
        [Description("Primary muscle group")] string primaryMuscle,
        [Description("Short description")] string? shortDescription = null,
        [Description("Activity type: weighted, machine, bodyweight, cardio")] string activityType = "weighted",
        [Description("How progress is tracked: repetitions, time, distance")] string activityTrackType = "repetitions",
        [Description("Required equipment")] string? equipment = null,
        [Description("Difficulty level: beginner, intermediate, advanced")] string? level = null,
        [Description("Force type: push, pull, static")] string? force = null,
        [Description("Mechanic: compound, isolation")] string? mechanic = null,
        [Description("Category")] string? category = null,
        CancellationToken ct = default) =>
        mediator.Send(new UpdateExcerciseCommand(id, new ExcerciseWriteRequest(
            name,
            shortDescription,
            primaryMuscle,
            null,
            null,
            ParseActivityType(activityType),
            ParseActivityTrackType(activityTrackType),
            null,
            equipment,
            level,
            force,
            mechanic,
            category)), ct);

    [McpServerTool]
    [Description("Delete an exercise by its numeric ID.")]
    public Task DeleteExercise(
        [Description("Numeric exercise ID to delete")] int id,
        CancellationToken ct) =>
        mediator.Send(new DeleteExcerciseCommand(id), ct);

    private static ActivityType ParseActivityType(string value) =>
        value.ToLowerInvariant() switch
        {
            "machine" => ActivityType.Machine,
            "bodyweight" => ActivityType.Bodyweight,
            "cardio" => ActivityType.Cardio,
            _ => ActivityType.Weighted,
        };

    private static ActivityTrackType ParseActivityTrackType(string value) =>
        value.ToLowerInvariant() switch
        {
            "time" => ActivityTrackType.Time,
            "distance" => ActivityTrackType.Distance,
            _ => ActivityTrackType.Repetitions,
        };
}
