using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record CreateFormTemplateCommand(FormTemplateCreate Request, string TrainerUserId) : IRequest<FormTemplateOut>
{
    internal sealed class Handler(IFormTemplateRepository repository) : IRequestHandler<CreateFormTemplateCommand, FormTemplateOut>
    {
        public async Task<FormTemplateOut> Handle(CreateFormTemplateCommand request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow.ToString("o");
            var version = new FormTemplateVersion
            {
                Id = Guid.NewGuid().ToString("N"),
                VersionNumber = 1,
                Fields = FormFieldMapper.ToEntities(request.Request.Fields),
                CreatedAt = now
            };

            var template = new FormTemplate
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                Description = request.Request.Description,
                TrainerUserId = request.TrainerUserId,
                IsActive = true,
                CurrentVersion = 1,
                CreatedAt = now,
                Versions = [version]
            };

            await repository.AddAsync(template, cancellationToken);

            return FormTemplateMapper.ToOut(template, version);
        }
    }
}
