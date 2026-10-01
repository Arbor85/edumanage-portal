namespace EduManage.Domain.Entities;

/// <summary>
/// A filled-in instance of a FormTemplateVersion that is not tied to any existing client record.
/// Captures respondent identity (firstName, lastName, etc.) directly on the response.
/// </summary>
public class StandaloneFormResponse
{
    public string Id { get; set; } = string.Empty;

    public string FormTemplateId { get; set; } = string.Empty;

    public string FormTemplateVersionId { get; set; } = string.Empty;

    public string TrainerUserId { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Gender { get; set; }

    public int? Age { get; set; }

    public string? Notes { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public List<FormAnswer> Answers { get; set; } = [];

    public FormTemplate? FormTemplate { get; set; }

    public FormTemplateVersion? FormTemplateVersion { get; set; }
}
