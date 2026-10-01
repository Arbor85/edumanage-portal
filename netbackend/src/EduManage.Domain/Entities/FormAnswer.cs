namespace EduManage.Domain.Entities;

/// <summary>
/// A single answer to one field of a FormTemplateVersion. Persisted as part of the
/// FormResponse's Answers JSON column.
/// </summary>
public class FormAnswer
{
    public string FieldId { get; set; } = string.Empty;

    /// <summary>Single value for text/number/boolean/date/scale/single-choice fields.</summary>
    public string? Value { get; set; }

    /// <summary>Multiple selected values for multi-choice fields.</summary>
    public List<string>? Values { get; set; }
}
