namespace EduManage.Domain.Entities;

/// <summary>
/// A filled-in instance of a FormTemplateVersion, captured for a specific Client and
/// optionally tied to a Meeting (e.g. a physiotherapy session note).
/// </summary>
public class FormResponse
{
    public string Id { get; set; } = string.Empty;

    public string FormTemplateId { get; set; } = string.Empty;

    public string FormTemplateVersionId { get; set; } = string.Empty;

    public string ClientId { get; set; } = string.Empty;

    public string? MeetingId { get; set; }

    public string FilledByUserId { get; set; } = string.Empty;

    public string CreatedAt { get; set; } = string.Empty;

    public List<FormAnswer> Answers { get; set; } = [];

    public FormTemplate? FormTemplate { get; set; }

    public FormTemplateVersion? FormTemplateVersion { get; set; }

    public Client? Client { get; set; }

    public Meeting? Meeting { get; set; }
}
