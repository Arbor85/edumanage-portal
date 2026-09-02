using EduManage.Application.Contracts;
using EduManage.Application.Features.Routines;
using EduManage.Mcp.Services;
using MediatR;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace EduManage.Mcp.Tools;

[McpServerToolType]
public sealed class RoutineTools(ISender sender, ICurrentTrainerService trainerService)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);
    private string UserId => trainerService.UserId;

    [McpServerTool, Description("List all routines (reusable workout templates).")]
    public async Task<string> ListRoutines(CancellationToken ct = default)
    {
        var routines = await sender.Send(new ListRoutinesQuery(UserId), ct);
        return JsonSerializer.Serialize(routines, JsonOpts);
    }

    [McpServerTool, Description("Get a routine by ID with full exercise and set details.")]
    public async Task<string> GetRoutine(
        [Description("The routine ID")] string routineId,
        CancellationToken ct = default)
    {
        try
        {
            var routine = await sender.Send(new GetRoutineQuery(routineId, UserId), ct);
            return JsonSerializer.Serialize(routine, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Create a new routine. excercisesJson is a JSON array: [{name, activityType (Weighted|Machine|Bodyweight|Cardio), activityTrackType (Repetitions|Time|Distance), sets: [{type, reps, weight}]}]")]
    public async Task<string> CreateRoutine(
        [Description("Routine name")] string name,
        [Description("Optional notes")] string? note = null,
        [Description("JSON array of exercises")] string excercisesJson = "[]",
        CancellationToken ct = default)
    {
        try
        {
            var exercises = JsonSerializer.Deserialize<List<RoutineExcercise>>(excercisesJson, JsonOpts) ?? [];
            var routine = await sender.Send(new AddRoutineCommand(new RoutineCreate(name, note, exercises), UserId), ct);
            return JsonSerializer.Serialize(routine, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Update an existing routine. excercisesJson replaces all existing exercises.")]
    public async Task<string> UpdateRoutine(
        [Description("The routine ID")] string routineId,
        [Description("Routine name")] string name,
        [Description("Optional notes")] string? note = null,
        [Description("JSON array of exercises (replaces all existing exercises)")] string excercisesJson = "[]",
        CancellationToken ct = default)
    {
        try
        {
            var exercises = JsonSerializer.Deserialize<List<RoutineExcercise>>(excercisesJson, JsonOpts) ?? [];
            var routine = await sender.Send(new UpdateRoutineCommand(routineId, new RoutineUpdate(name, note, exercises), UserId), ct);
            return JsonSerializer.Serialize(routine, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Delete a routine by ID.")]
    public async Task<string> DeleteRoutine(
        [Description("The routine ID")] string routineId,
        CancellationToken ct = default)
    {
        try
        {
            await sender.Send(new DeleteRoutineCommand(routineId, UserId), ct);
            return "Routine deleted successfully.";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
