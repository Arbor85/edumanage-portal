using EduManage.Application.Contracts;

namespace EduManage.Application.Common;

public static class FormToonSerializer
{
    public static string Serialize(FormTemplateOut template, IReadOnlyList<StandaloneFormResponseOut> responses)
    {
        var toon = new ToonWriter();

        toon.Prop("id", template.Id)
            .Prop("name", template.Name);

        if (template.Description is not null)
            toon.Prop("description", template.Description);

        toon.Prop("version", template.CurrentVersion);

        var fields = template.Fields.OrderBy(f => f.Order).ToList();

        // Fields definition table
        var fieldRows = fields
            .Select(f => (IReadOnlyList<string?>)new string?[] { f.Id, f.Label, f.Type, f.Required ? "true" : "false" })
            .ToList();
        toon.TabularArray("fields", ["id", "label", "type", "required"], fieldRows);

        // Options block for choice fields
        var fieldsWithOptions = fields.Where(f => f.Options?.Count > 0).ToList();
        if (fieldsWithOptions.Count > 0)
        {
            toon.BeginObject("fieldOptions");
            foreach (var f in fieldsWithOptions)
                toon.PrimitiveArray(f.Id, f.Options!);
            toon.EndObject();
        }

        // Responses pivot: metadata columns + one column per field label
        var metaHeaders = new[] { "id", "firstName", "lastName", "age", "gender", "createdAt" };
        var allHeaders = metaHeaders.Concat(fields.Select(f => f.Label)).ToList();

        var responseRows = responses
            .Select(r =>
            {
                var answerMap = r.Answers.ToDictionary(
                    a => a.FieldId,
                    a => a.Values is { Count: > 0 } ? string.Join("|", a.Values) : a.Value);

                var meta = new string?[] { r.Id, r.FirstName, r.LastName, r.Age?.ToString(), r.Gender, r.CreatedAt };
                var answers = fields.Select(f => answerMap.TryGetValue(f.Id, out var v) ? v : null);
                return (IReadOnlyList<string?>)meta.Concat(answers).ToArray();
            })
            .ToList();

        toon.TabularArray("responses", allHeaders, responseRows);

        return toon.ToString();
    }
}
