using EduManage.Application.Features.Clients;
using EduManage.Application.Features.Excercises;
using EduManage.Mcp.Services;
using MediatR;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace EduManage.Mcp.Tools;

[McpServerToolType]
public sealed class ClientTools(ISender sender, ICurrentTrainerService trainerService)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);
    private string UserId => trainerService.UserId;

    [McpServerTool, Description("List all trainer clients. Returns client names and invitation codes (the invitationCode is used as clientId when creating plans).")]
    public async Task<string> ListClients(CancellationToken ct = default)
    {
        var clients = await sender.Send(new ListClientsQuery(UserId), ct);
        return JsonSerializer.Serialize(clients, JsonOpts);
    }

    [McpServerTool, Description("Search the exercise library. Returns exercises with id, name, primaryMuscle, activityType, and activityTrackType.")]
    public async Task<string> ListExercises(
        [Description("Optional search term to filter exercises by name (case-insensitive)")] string? search = null,
        CancellationToken ct = default)
    {
        var exercises = await sender.Send(new ListExcercisesQuery(UserId), ct);
        if (!string.IsNullOrWhiteSpace(search))
            exercises = exercises
                .Where(e => e.Name.Contains(search, StringComparison.OrdinalIgnoreCase))
                .ToList();
        return JsonSerializer.Serialize(exercises, JsonOpts);
    }
}
