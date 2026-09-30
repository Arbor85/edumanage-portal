namespace EduManage.Domain.Entities;

/// <summary>
/// A reusable, versioned questionnaire template (e.g. "Post-Physiotherapy Session Form")
/// defined by a trainer/physiotherapist and filled in after client sessions.
/// </summary>
public class FormTemplate
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string TrainerUserId { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    /// <summary>VersionNumber of the most recently published FormTemplateVersion.</summary>
    public int CurrentVersion { get; set; } = 1;

    public string CreatedAt { get; set; } = string.Empty;

    public ICollection<FormTemplateVersion> Versions { get; set; } = [];

    public ICollection<FormResponse> Responses { get; set; } = [];
}
