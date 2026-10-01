using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record ListStandaloneFormResponsesQuery(string FormTemplateId, string TrainerUserId) : IRequest<IReadOnlyList<StandaloneFormResponseOut>>
{
    internal sealed class Handler(
        IFormTemplateRepository templateRepository,
        IFormTemplateVersionRepository versionRepository,
        IStandaloneFormResponseRepository responseRepository) : IRequestHandler<ListStandaloneFormResponsesQuery, IReadOnlyList<StandaloneFormResponseOut>>
    {
        public async Task<IReadOnlyList<StandaloneFormResponseOut>> Handle(ListStandaloneFormResponsesQuery request, CancellationToken cancellationToken)
        {
            var template = await templateRepository.GetByIdAsync(request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.FormTemplateId}' was not found.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException("You do not have permission to view responses for this template.");

            var responses = await responseRepository.ListByTemplateAsync(request.FormTemplateId, request.TrainerUserId, cancellationToken);

            var result = new List<StandaloneFormResponseOut>(responses.Count);
            foreach (var r in responses)
            {
                var version = await versionRepository.GetByIdAsync(r.FormTemplateVersionId, cancellationToken);
                result.Add(new StandaloneFormResponseOut(
                    r.Id,
                    r.FormTemplateId,
                    r.FormTemplateVersionId,
                    version?.VersionNumber ?? 0,
                    r.TrainerUserId,
                    r.FirstName,
                    r.LastName,
                    r.Gender,
                    r.Age,
                    r.Notes,
                    r.CreatedAt,
                    r.Answers.Select(a => new FormAnswerDto(a.FieldId, a.Value, a.Values)).ToList()));
            }

            return result;
        }
    }
}
