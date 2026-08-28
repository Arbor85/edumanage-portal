using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.ScheduleEntries;

public sealed record DeleteScheduleEntryCommand(string EntryId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IScheduleEntryRepository repo) : IRequestHandler<DeleteScheduleEntryCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteScheduleEntryCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.EntryId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
