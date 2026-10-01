using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Application.Features.Forms;

internal static class FormFieldMapper
{
    public static List<FormFieldDefinition> ToEntities(IReadOnlyList<FormFieldDefinitionDto> fields) =>
        fields.Select(f => new FormFieldDefinition
        {
            Id = string.IsNullOrWhiteSpace(f.Id) ? Guid.NewGuid().ToString("N") : f.Id,
            Label = f.Label,
            Type = Enum.Parse<FormFieldType>(f.Type, ignoreCase: true),
            Required = f.Required,
            Order = f.Order,
            Options = f.Options?.ToList() ?? [],
            Min = f.Min,
            Max = f.Max,
            HelpText = f.HelpText
        }).ToList();

    public static List<FormFieldDefinitionDto> ToDtos(IEnumerable<FormFieldDefinition> fields) =>
        fields
            .OrderBy(f => f.Order)
            .Select(f => new FormFieldDefinitionDto(f.Id, f.Label, f.Type.ToString(), f.Required, f.Order, f.Options, f.Min, f.Max, f.HelpText))
            .ToList();
}

internal static class FormTemplateMapper
{
    public static FormTemplateOut ToOut(FormTemplate template, FormTemplateVersion latestVersion) =>
        new(
            template.Id,
            template.Name,
            template.Description,
            template.IsActive,
            template.CurrentVersion,
            template.TrainerUserId,
            template.CreatedAt,
            FormFieldMapper.ToDtos(latestVersion.Fields));
}
