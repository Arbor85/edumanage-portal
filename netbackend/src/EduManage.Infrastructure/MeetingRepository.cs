using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class MeetingRepository(EduManageDbContext dbContext) : RepositoryBase(dbContext), IMeetingRepository
{
    public Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken)
    {
        return ListAsync<MeetingOut>(RepositoryCategories.Meetings, cancellationToken);
    }

    public async Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken)
    {
        var id = NewId();
        var meeting = new MeetingOut(request.ClientId, request.StartsAt, request.Price, id, "local-user");
        await SaveAsync(RepositoryCategories.Meetings, id, meeting, cancellationToken);
        return meeting;
    }

    public async Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken)
    {
        var existing = await FindAsync<MeetingOut>(RepositoryCategories.Meetings, meetingId, cancellationToken);
        if (existing is null)
        {
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");
        }

        var meeting = new MeetingOut(request.ClientId, request.StartsAt, request.Price, meetingId, "local-user");
        await SaveAsync(RepositoryCategories.Meetings, meetingId, meeting, cancellationToken);
        return meeting;
    }

    public async Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken)
    {
        var deleted = await DeleteAsync(RepositoryCategories.Meetings, meetingId, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");
        }

        return new Dictionary<string, string> { ["detail"] = "Meeting deleted" };
    }
}
