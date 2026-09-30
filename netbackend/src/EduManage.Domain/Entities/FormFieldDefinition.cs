namespace EduManage.Domain.Entities;

/// <summary>
/// Definition of a single field within a FormTemplateVersion. Persisted as part of the
/// version's Fields JSON column - not a standalone EF entity/table.
/// </summary>
public class FormFieldDefinition
{
    public string Id { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public FormFieldType Type { get; set; } = FormFieldType.Text;

    public bool Required { get; set; }

    public int Order { get; set; }

    /// <summary>Selectable options for SingleChoice/MultiChoice fields.</summary>
    public List<string> Options { get; set; } = [];

    /// <summary>Lower bound for Number/Scale fields.</summary>
    public double? Min { get; set; }

    /// <summary>Upper bound for Number/Scale fields.</summary>
    public double? Max { get; set; }

    public string? HelpText { get; set; }
}
