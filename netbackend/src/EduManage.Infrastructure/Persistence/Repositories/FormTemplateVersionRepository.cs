using EduManage.Application.Contracts;
using EduManage.Domain.Entities;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class FormTemplateVersionRepository(EduManageDbContext context)
    : BaseRepository<FormTemplateVersion, string>(context), IFormTemplateVersionRepository
{
}
