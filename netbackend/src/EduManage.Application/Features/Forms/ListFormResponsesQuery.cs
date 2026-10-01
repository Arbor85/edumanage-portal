using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record ListFormResponsesQuery(string ClientId, string TrainerUserId) : IRequest<IReadOnlyList<FormResponseOut>>
{
    internal sealed class Handler(
        IFormResponseRepository responseRepository,
        IFormTemplateVersionRepository versionRepository,
        IClientRepository clientRepository) : IRequestHandler<ListFormResponsesQuery, IReadOnlyList<FormResponseOut>>
    {
        public async Task<IReadOnlyList<FormResponseOut>> Handle(ListFormResponsesQuery request, CancellationToken cancellationToken)
        {
            var client = await clientRepository.GetByIdAsync(request.ClientId, cancellationToken)
                ?? throw new NotFoundException($"Client '{request.ClientId}' was not found.");

            if (client.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException($"You do not have permission to view forms for client '{request.ClientId}'.");

            var responses = await responseRepository.ListByClientAsync(request.ClientId, cancellationToken);

            var result = new List<FormResponseOut>(responses.Count);
            foreach (var response in responses)
            {
                var version = await versionRepository.GetByIdAsync(response.FormTemplateVersionId, cancellationToken);
                result.Add(new FormResponseOut(
                    response.Id,
                    response.FormTemplateId,
                    response.FormTemplateVersionId,
                    version?.VersionNumber ?? 0,
                    response.ClientId,
                    response.MeetingId,
                    response.FilledByUserId,
                    response.CreatedAt,
                    response.Answers.Select(a => new FormAnswerDto(a.FieldId, a.Value, a.Values)).ToList()));
            }

            return result;
        }
    }
}
