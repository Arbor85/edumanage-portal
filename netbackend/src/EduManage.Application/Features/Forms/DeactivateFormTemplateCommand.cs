using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

/// <summary>
/// Soft-deletes (deactivates) a FormTemplate rather than hard-deleting it, so existing
/// FormResponses that reference its versions remain intact and readable.
/// </summary>
public sealed record DeactivateFormTemplateCommand(string FormTemplateId, string TrainerUserId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IFormTemplateRepository repository) : IRequestHandler<DeactivateFormTemplateCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeactivateFormTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await repository.GetByIdAsync(request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.FormTemplateId}' was not found.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException($"You do not have permission to delete form template '{request.FormTemplateId}'.");

            template.IsActive = false;
            await repository.UpdateAsync(template, cancellationToken);

            return new Dictionary<string, string> { ["status"] = "deactivated" };
        }
    }
}
