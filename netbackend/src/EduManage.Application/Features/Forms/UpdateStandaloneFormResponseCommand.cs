using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record UpdateStandaloneFormResponseCommand(string ResponseId, StandaloneFormResponseCreate Request, string TrainerUserId) : IRequest<StandaloneFormResponseOut>
{
    internal sealed class Handler(
        IStandaloneFormResponseRepository responseRepository,
        IFormTemplateRepository templateRepository,
        IFormTemplateVersionRepository versionRepository) : IRequestHandler<UpdateStandaloneFormResponseCommand, StandaloneFormResponseOut>
    {
        public async Task<StandaloneFormResponseOut> Handle(UpdateStandaloneFormResponseCommand request, CancellationToken cancellationToken)
        {
            var response = await responseRepository.GetByIdAsync(request.ResponseId, cancellationToken)
                ?? throw new NotFoundException($"Response '{request.ResponseId}' was not found.");

            if (response.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException("You do not have permission to edit this response.");

            var template = await templateRepository.GetByIdAsync(response.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{response.FormTemplateId}' was not found.");

            var version = await versionRepository.GetByIdAsync(response.FormTemplateVersionId, cancellationToken);

            var missingRequired = (version?.Fields ?? [])
                .Where(f => f.Required)
                .Select(f => f.Id)
                .Except(request.Request.Answers
                    .Where(a => !string.IsNullOrWhiteSpace(a.Value) || (a.Values?.Count ?? 0) > 0)
                    .Select(a => a.FieldId))
                .ToList();

            if (missingRequired.Count > 0)
                throw new ValidationException($"Missing required field(s): {string.Join(", ", missingRequired)}");

            response.FirstName = request.Request.FirstName;
            response.LastName = request.Request.LastName;
            response.Gender = request.Request.Gender;
            response.Age = request.Request.Age;
            response.Notes = request.Request.Notes;
            response.Answers = request.Request.Answers
                .Select(a => new FormAnswer { FieldId = a.FieldId, Value = a.Value, Values = a.Values?.ToList() })
                .ToList();

            await responseRepository.UpdateAsync(response, cancellationToken);

            return new StandaloneFormResponseOut(
                response.Id,
                response.FormTemplateId,
                response.FormTemplateVersionId,
                version?.VersionNumber ?? 0,
                response.TrainerUserId,
                response.FirstName,
                response.LastName,
                response.Gender,
                response.Age,
                response.Notes,
                response.CreatedAt,
                response.Answers.Select(a => new FormAnswerDto(a.FieldId, a.Value, a.Values)).ToList());
        }
    }
}
