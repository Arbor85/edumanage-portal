using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record SubmitStandaloneFormResponseCommand(StandaloneFormResponseCreate Request, string TrainerUserId) : IRequest<StandaloneFormResponseOut>
{
    internal sealed class Handler(
        IFormTemplateRepository templateRepository,
        IStandaloneFormResponseRepository responseRepository) : IRequestHandler<SubmitStandaloneFormResponseCommand, StandaloneFormResponseOut>
    {
        public async Task<StandaloneFormResponseOut> Handle(SubmitStandaloneFormResponseCommand request, CancellationToken cancellationToken)
        {
            var template = await templateRepository.GetByIdAsync(request.Request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.Request.FormTemplateId}' was not found.");

            if (!template.IsActive)
                throw new ValidationException($"Form template '{request.Request.FormTemplateId}' is no longer active.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException("You do not have permission to submit this form.");

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

            var response = new StandaloneFormResponse
            {
                Id = Guid.NewGuid().ToString("N"),
                FormTemplateId = template.Id,
                FormTemplateVersionId = latestVersion.Id,
                TrainerUserId = request.TrainerUserId,
                FirstName = request.Request.FirstName,
                LastName = request.Request.LastName,
                Gender = request.Request.Gender,
                Age = request.Request.Age,
                Notes = request.Request.Notes,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                Answers = request.Request.Answers
                    .Select(a => new FormAnswer { FieldId = a.FieldId, Value = a.Value, Values = a.Values?.ToList() })
                    .ToList()
            };

            await responseRepository.AddAsync(response, cancellationToken);

            return ToOut(response, latestVersion.VersionNumber);
        }

        private static StandaloneFormResponseOut ToOut(StandaloneFormResponse r, int versionNumber) => new(
            r.Id,
            r.FormTemplateId,
            r.FormTemplateVersionId,
            versionNumber,
            r.TrainerUserId,
            r.FirstName,
            r.LastName,
            r.Gender,
            r.Age,
            r.Notes,
            r.CreatedAt,
            r.Answers.Select(a => new FormAnswerDto(a.FieldId, a.Value, a.Values)).ToList());
    }
}
