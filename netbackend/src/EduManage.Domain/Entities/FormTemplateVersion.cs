namespace EduManage.Domain.Entities;

/// <summary>
/// Immutable snapshot of a FormTemplate's field definitions at a point in time. FormResponses
/// reference the specific version they were answered against so editing a template later does
/// not change the meaning of previously submitted answers.
/// </summary>
public class FormTemplateVersion
{
    public string Id { get; set; } = string.Empty;

    public string FormTemplateId { get; set; } = string.Empty;

    public int VersionNumber { get; set; }

    public ICollection<FormFieldDefinition> Fields { get; set; } = [];

    public string CreatedAt { get; set; } = string.Empty;

    public FormTemplate? FormTemplate { get; set; }
}
