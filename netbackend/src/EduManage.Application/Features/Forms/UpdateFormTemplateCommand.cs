using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using System.Text.Json;

namespace EduManage.Application.Features.Forms;

/// <summary>
/// Updates a FormTemplate's metadata. When the submitted field definitions differ from the
/// current version, a new immutable FormTemplateVersion is published and CurrentVersion is
/// bumped, so previously submitted FormResponses keep referencing their original version.
/// </summary>
public sealed record UpdateFormTemplateCommand(string FormTemplateId, FormTemplateUpdate Request, string TrainerUserId) : IRequest<FormTemplateOut>
{
    internal sealed class Handler(IFormTemplateRepository repository, IFormTemplateVersionRepository versionRepository)
        : IRequestHandler<UpdateFormTemplateCommand, FormTemplateOut>
    {
        public async Task<FormTemplateOut> Handle(UpdateFormTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await repository.GetByIdAsync(request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.FormTemplateId}' was not found.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException($"You do not have permission to edit form template '{request.FormTemplateId}'.");

            template.Name = request.Request.Name;
            template.Description = request.Request.Description;
            template.IsActive = request.Request.IsActive;

            var latestVersion = template.Versions
                .OrderByDescending(v => v.VersionNumber)
                .First();

            var newFields = FormFieldMapper.ToEntities(request.Request.Fields);
            var currentDtos = FormFieldMapper.ToDtos(latestVersion.Fields);
            var fieldsChanged = JsonSerializer.Serialize(currentDtos) != JsonSerializer.Serialize(request.Request.Fields.OrderBy(f => f.Order));

            var versionToReturn = latestVersion;
            if (fieldsChanged)
            {
                versionToReturn = new FormTemplateVersion
                {
                    Id = Guid.NewGuid().ToString("N"),
                    FormTemplateId = template.Id,
                    VersionNumber = template.CurrentVersion + 1,
                    Fields = newFields,
                    CreatedAt = DateTime.UtcNow.ToString("o")
                };
                await versionRepository.AddAsync(versionToReturn, cancellationToken);
                template.CurrentVersion = versionToReturn.VersionNumber;
            }

            await repository.UpdateAsync(template, cancellationToken);

            return FormTemplateMapper.ToOut(template, versionToReturn);
        }
    }
}
