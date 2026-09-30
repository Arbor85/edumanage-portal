using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Forms;

public sealed record ListFormTemplatesQuery(string TrainerUserId) : IRequest<IReadOnlyList<FormTemplateOut>>
{
    internal sealed class Handler(IFormTemplateRepository repository) : IRequestHandler<ListFormTemplatesQuery, IReadOnlyList<FormTemplateOut>>
    {
        public async Task<IReadOnlyList<FormTemplateOut>> Handle(ListFormTemplatesQuery request, CancellationToken cancellationToken)
        {
            var templates = await repository.ListByTrainerAsync(request.TrainerUserId, cancellationToken);
            return templates
                .Select(t => FormTemplateMapper.ToOut(t, t.Versions.OrderByDescending(v => v.VersionNumber).First()))
                .ToList();
        }
    }
}
