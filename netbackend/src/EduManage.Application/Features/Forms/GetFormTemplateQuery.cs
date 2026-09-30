using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record GetFormTemplateQuery(string FormTemplateId, string TrainerUserId) : IRequest<FormTemplateOut>
{
    internal sealed class Handler(IFormTemplateRepository repository) : IRequestHandler<GetFormTemplateQuery, FormTemplateOut>
    {
        public async Task<FormTemplateOut> Handle(GetFormTemplateQuery request, CancellationToken cancellationToken)
        {
            var template = await repository.GetByIdAsync(request.FormTemplateId, cancellationToken)
                ?? throw new NotFoundException($"Form template '{request.FormTemplateId}' was not found.");

            if (template.TrainerUserId != request.TrainerUserId)
                throw new UnauthorizedAccessException($"You do not have permission to view form template '{request.FormTemplateId}'.");

            var latestVersion = template.Versions.OrderByDescending(v => v.VersionNumber).First();
            return FormTemplateMapper.ToOut(template, latestVersion);
        }
    }
}
