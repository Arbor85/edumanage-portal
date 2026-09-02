using EduManage.Application.Contracts;
using EduManage.Application.Features.Plans;
using MediatR;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace EduManage.Mcp.Tools;

[McpServerToolType]
public sealed class PlanTools(ISender sender, IOptions<McpSettings> settings)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);
    private string UserId => settings.Value.TrainerUserId;

    [McpServerTool, Description("List all training plans. Returns plan summaries with id, name, status, and clientId.")]
    public async Task<string> ListPlans(
        [Description("Optional client invitation code to show plans for a specific client only")] string? clientId,
        CancellationToken ct)
    {
        var plans = await sender.Send(new ListPlansQuery(UserId), ct);
        if (clientId is not null)
            plans = plans.Where(p => p.ClientId == clientId).ToList();
        return JsonSerializer.Serialize(plans, JsonOpts);
    }

    [McpServerTool, Description("Get a training plan by ID with full workout and exercise details.")]
    public async Task<string> GetPlan(
        [Description("The plan ID")] string planId,
        CancellationToken ct)
    {
        try
        {
            var plan = await sender.Send(new GetPlanQuery(planId, UserId), ct);
            return JsonSerializer.Serialize(plan, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Create a new training plan. workoutsJson is a JSON array of workout objects: [{name, note, date (YYYY-MM-DD), excercises: [{name, activityType (Weighted|Machine|Bodyweight|Cardio), activityTrackType (Repetitions|Time|Distance), sets: [{type, reps, weight}]}]}]")]
    public async Task<string> CreatePlan(
        [Description("Plan name")] string name,
        [Description("Optional client invitation code to assign the plan to a client")] string? clientId,
        [Description("Optional notes about the plan")] string? note,
        [Description("JSON array of workouts")] string workoutsJson,
        CancellationToken ct)
    {
        try
        {
            var workouts = JsonSerializer.Deserialize<List<PlanWorkoutInput>>(workoutsJson, JsonOpts) ?? [];
            var plan = await sender.Send(new AddPlanCommand(new PlanCreate(name, clientId, note, workouts), UserId), ct);
            return JsonSerializer.Serialize(plan, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Update an existing training plan. workoutsJson replaces all existing workouts.")]
    public async Task<string> UpdatePlan(
        [Description("The plan ID")] string planId,
        [Description("Plan name")] string name,
        [Description("Optional client invitation code")] string? clientId,
        [Description("Optional notes")] string? note,
        [Description("JSON array of workouts (replaces all existing workouts)")] string workoutsJson,
        CancellationToken ct)
    {
        try
        {
            var workouts = JsonSerializer.Deserialize<List<PlanWorkoutInput>>(workoutsJson, JsonOpts) ?? [];
            var plan = await sender.Send(new UpdatePlanCommand(planId, new PlanUpdate(name, clientId, note, workouts), UserId), ct);
            return JsonSerializer.Serialize(plan, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Delete a training plan by ID.")]
    public async Task<string> DeletePlan(
        [Description("The plan ID")] string planId,
        CancellationToken ct)
    {
        try
        {
            await sender.Send(new DeletePlanCommand(planId, UserId), ct);
            return "Plan deleted successfully.";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description("Update the status of a training plan. Valid statuses: Draft, Published, Completed.")]
    public async Task<string> UpdatePlanStatus(
        [Description("The plan ID")] string planId,
        [Description("New status: Draft, Published, or Completed")] string status,
        CancellationToken ct)
    {
        try
        {
            var plan = await sender.Send(new UpdatePlanStatusCommand(planId, new PlanStatusUpdate(status), UserId), ct);
            return JsonSerializer.Serialize(plan, JsonOpts);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
