using EduManage.Application.Common;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Forms;
using EduManage.Mcp.Services;
using MediatR;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace EduManage.Mcp.Tools;

[McpServerToolType]
public sealed class FormTools(ISender sender, ICurrentTrainerService trainerService)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);
    private string UserId => trainerService.UserId;

    [McpServerTool, Description("List all form templates. Returns id, name, description, currentVersion, isActive.")]
    public async Task<string> ListFormTemplates(CancellationToken ct = default)
    {
        var templates = await sender.Send(new ListFormTemplatesQuery(UserId), ct);
        return JsonSerializer.Serialize(
            templates.Select(t => new { t.Id, t.Name, t.Description, t.CurrentVersion, t.IsActive }),
            JsonOpts);
    }

    [McpServerTool, Description(
        "Get a form template with all standalone responses in TOON format (token-efficient). " +
        "Output sections: fields table (id, label, type, required), fieldOptions (choice field options), " +
        "responses table (metadata + one column per field label, multi-choice answers joined with |).")]
    public async Task<string> GetFormTemplateWithAnswers(
        [Description("The form template ID")] string templateId,
        CancellationToken ct = default)
    {
        try
        {
            var template = await sender.Send(new GetFormTemplateQuery(templateId, UserId), ct);
            var responses = await sender.Send(new ListStandaloneFormResponsesQuery(templateId, UserId), ct);
            return FormToonSerializer.Serialize(template, responses);
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    [McpServerTool, Description(
        "Submit a standalone form response (not tied to a client). " +
        "answersJson is a JSON array: [{\"fieldId\":\"...\",\"value\":\"...\",\"values\":[...]}]. " +
        "Use 'values' (string array) for MultiChoice fields; use 'value' (string) for all other field types. " +
        "Get field IDs from GetFormTemplateWithAnswers or ListFormTemplates.")]
    public async Task<string> SubmitStandaloneFormResponse(
        [Description("The form template ID")] string formTemplateId,
        [Description("Respondent first name")] string firstName,
        [Description("Respondent last name")] string lastName,
        [Description("JSON array of answers")] string answersJson,
        [Description("Optional gender")] string? gender = null,
        [Description("Optional age")] int? age = null,
        [Description("Optional notes")] string? notes = null,
        CancellationToken ct = default)
    {
        try
        {
            var answers = JsonSerializer.Deserialize<List<FormAnswerDto>>(answersJson, JsonOpts) ?? [];
            var request = new StandaloneFormResponseCreate(formTemplateId, firstName, lastName, gender, age, notes, answers);
            var result = await sender.Send(new SubmitStandaloneFormResponseCommand(request, UserId), ct);
            return $"Submitted. Response ID: {result.Id}";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
