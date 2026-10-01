using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record GetStandaloneFormResponsesSummaryQuery(string FormTemplateId, string TrainerUserId) : IRequest<StandaloneFormResponsesSummaryOut>
{
    internal sealed class Handler(
        IFormTemplateRepository templateRepository,
        IStandaloneFormResponseRepository responseRepository) : IRequestHandler<GetStandaloneFormResponsesSummaryQuery, StandaloneFormResponsesSummaryOut>
    {
        public async Task<StandaloneFormResponsesSummaryOut> Handle(GetStandaloneFormResponsesSummaryQuery request, CancellationToken cancellationToken)
        {
            var template = await templateRepository.GetByIdAsync(request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.FormTemplateId}' was not found.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException("You do not have permission to view the summary for this template.");

            var responses = await responseRepository.ListByTemplateAsync(request.FormTemplateId, request.TrainerUserId, cancellationToken);

            var latestVersion = template.Versions.OrderByDescending(v => v.VersionNumber).First();
            var fields = latestVersion.Fields.OrderBy(f => f.Order).ToList();

            var fieldSummaries = fields.Select(field => BuildFieldSummary(field, responses)).ToList();

            return new StandaloneFormResponsesSummaryOut(
                template.Id,
                template.Name,
                responses.Count,
                fieldSummaries);
        }

        private static FieldSummaryOut BuildFieldSummary(FormFieldDefinition field, IReadOnlyList<StandaloneFormResponse> responses)
        {
            var allAnswers = responses
                .SelectMany(r => r.Answers.Where(a => a.FieldId == field.Id))
                .ToList();

            var responseCount = allAnswers.Count(a =>
                !string.IsNullOrWhiteSpace(a.Value) || (a.Values?.Count ?? 0) > 0);

            return field.Type switch
            {
                FormFieldType.Number or FormFieldType.Scale => BuildNumericSummary(field, allAnswers, responseCount),
                FormFieldType.SingleChoice => BuildOptionSummary(field, allAnswers.Select(a => a.Value).OfType<string>().ToList(), responseCount),
                FormFieldType.MultiChoice => BuildMultiChoiceSummary(field, allAnswers, responseCount),
                FormFieldType.Boolean => BuildBooleanSummary(field, allAnswers, responseCount),
                _ => BuildTextSummary(field, allAnswers, responseCount)
            };
        }

        private static FieldSummaryOut BuildNumericSummary(FormFieldDefinition field, List<FormAnswer> answers, int responseCount)
        {
            var nums = answers
                .Select(a => a.Value)
                .Where(v => !string.IsNullOrWhiteSpace(v) && double.TryParse(v, out _))
                .Select(v => double.Parse(v!))
                .ToList();

            return new FieldSummaryOut(
                field.Id, field.Label, field.Type.ToString(), responseCount,
                nums.Count > 0 ? Math.Round(nums.Average(), 2) : null,
                nums.Count > 0 ? nums.Min() : null,
                nums.Count > 0 ? nums.Max() : null,
                null, null);
        }

        private static FieldSummaryOut BuildOptionSummary(FormFieldDefinition field, List<string> values, int responseCount)
        {
            var counts = values
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .GroupBy(v => v)
                .ToDictionary(g => g.Key, g => g.Count());

            return new FieldSummaryOut(field.Id, field.Label, field.Type.ToString(), responseCount,
                null, null, null, counts, null);
        }

        private static FieldSummaryOut BuildMultiChoiceSummary(FormFieldDefinition field, List<FormAnswer> answers, int responseCount)
        {
            var counts = answers
                .SelectMany(a => a.Values ?? [])
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .GroupBy(v => v)
                .ToDictionary(g => g.Key, g => g.Count());

            return new FieldSummaryOut(field.Id, field.Label, field.Type.ToString(), responseCount,
                null, null, null, counts, null);
        }

        private static FieldSummaryOut BuildBooleanSummary(FormFieldDefinition field, List<FormAnswer> answers, int responseCount)
        {
            var trueCount = answers.Count(a => a.Value == "true");
            var falseCount = answers.Count(a => a.Value == "false");
            var counts = new Dictionary<string, int> { ["true"] = trueCount, ["false"] = falseCount };

            return new FieldSummaryOut(field.Id, field.Label, field.Type.ToString(), responseCount,
                null, null, null, counts, null);
        }

        private static FieldSummaryOut BuildTextSummary(FormFieldDefinition field, List<FormAnswer> answers, int responseCount)
        {
            var texts = answers
                .Select(a => a.Value)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .OfType<string>()
                .ToList();

            return new FieldSummaryOut(field.Id, field.Label, field.Type.ToString(), responseCount,
                null, null, null, null, texts);
        }
    }
}
