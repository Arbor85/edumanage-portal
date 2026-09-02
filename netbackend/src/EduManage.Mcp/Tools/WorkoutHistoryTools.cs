using EduManage.Application.Features.WorkoutHistories;
using EduManage.Mcp.Services;
using MediatR;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace EduManage.Mcp.Tools;

[McpServerToolType]
public sealed class WorkoutHistoryTools(ISender sender, ICurrentTrainerService trainerService)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);
    private string UserId => trainerService.UserId;

    [McpServerTool, Description("List completed workout sessions ordered by date descending. Shows id, mode, startedAt, completedAt, totalSets, completedSets, and source workout.")]
    public async Task<string> ListWorkoutHistory(
        [Description("Optional start date filter in ISO 8601 format, e.g. 2026-01-01T00:00:00")] string? from = null,
        [Description("Optional end date filter in ISO 8601 format, e.g. 2026-12-31T23:59:59")] string? to = null,
        CancellationToken ct = default)
    {
        var history = await sender.Send(new ListWorkoutHistoryQuery(UserId, from, to), ct);
        return JsonSerializer.Serialize(history, JsonOpts);
    }

    [McpServerTool, Description("Get a single completed workout session with all exercises and sets.")]
    public async Task<string> GetWorkoutHistory(
        [Description("The workout history ID")] string id,
        CancellationToken ct = default)
    {
        try
        {
            var history = await sender.Send(new GetWorkoutHistoryQuery(id, UserId), ct);
            return JsonSerializer.Serialize(history, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
