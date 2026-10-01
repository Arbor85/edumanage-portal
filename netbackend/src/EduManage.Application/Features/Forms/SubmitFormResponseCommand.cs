using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record SubmitFormResponseCommand(FormResponseCreate Request, string FilledByUserId) : IRequest<FormResponseOut>
{
    internal sealed class Handler(
        IFormTemplateRepository templateRepository,
        IFormResponseRepository responseRepository,
        IClientRepository clientRepository) : IRequestHandler<SubmitFormResponseCommand, FormResponseOut>
    {
        public async Task<FormResponseOut> Handle(SubmitFormResponseCommand request, CancellationToken cancellationToken)
        {
            var template = await templateRepository.GetByIdAsync(request.Request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.Request.FormTemplateId}' was not found.");

            if (!template.IsActive)
                throw new ValidationException($"Form template '{request.Request.FormTemplateId}' is no longer active.");

            var client = await clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken)
                ?? throw new NotFoundException($"Client '{request.Request.ClientId}' was not found.");

            if (client.TrainerUserId != template.TrainerUserId || template.TrainerUserId != request.FilledByUserId)
                throw new UnauthorizedAccessException("You do not have permission to submit this form for this client.");

            var latestVersion = template.Versions.OrderByDescending(v => v.VersionNumber).First();

            var missingRequired = latestVersion.Fields
                .Where(f => f.Required)
                .Select(f => f.Id)
                .Except(request.Request.Answers
                    .Where(a => !string.IsNullOrWhiteSpace(a.Value) || (a.Values?.Count ?? 0) > 0)
                    .Select(a => a.FieldId))
                .ToList();

            if (missingRequired.Count > 0)
                throw new ValidationException($"Missing required field(s): {string.Join(", ", missingRequired)}");

            var response = new FormResponse
            {
                Id = Guid.NewGuid().ToString("N"),
                FormTemplateId = template.Id,
                FormTemplateVersionId = latestVersion.Id,
                ClientId = request.Request.ClientId,
                MeetingId = request.Request.MeetingId,
                FilledByUserId = request.FilledByUserId,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                Answers = request.Request.Answers
                    .Select(a => new FormAnswer { FieldId = a.FieldId, Value = a.Value, Values = a.Values?.ToList() })
                    .ToList()
            };

            await responseRepository.AddAsync(response, cancellationToken);

            return ToOut(response, latestVersion.VersionNumber);
        }

        private static FormResponseOut ToOut(FormResponse response, int versionNumber) => new(
            response.Id,
            response.FormTemplateId,
            response.FormTemplateVersionId,
            versionNumber,
            response.ClientId,
            response.MeetingId,
            response.FilledByUserId,
            response.CreatedAt,
            response.Answers.Select(a => new FormAnswerDto(a.FieldId, a.Value, a.Values)).ToList());
    }
}
