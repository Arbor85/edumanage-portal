using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class MeetingRepository : IMeetingRepository
{
    private readonly EduManageDbContext _context;

    public MeetingRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken)
    {
        var meetings = await _context.Meetings.ToListAsync(cancellationToken);
        return meetings.Select(m => new MeetingOut(m.ClientId, m.StartsAt, m.Price, m.Id, m.UserId)).ToList();
    }

    public async Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken)
    {
        var meeting = new Meeting
        {
            Id = Guid.NewGuid().ToString("N"),
            ClientId = request.ClientId,
            StartsAt = request.StartsAt,
            Price = request.Price,
            UserId = "local-user"
        };

        _context.Meetings.Add(meeting);
        await _context.SaveChangesAsync(cancellationToken);

        return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
    }

    public async Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken)
    {
        var meeting = await _context.Meetings.FindAsync([meetingId], cancellationToken: cancellationToken);
        if (meeting is null)
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");

        meeting.ClientId = request.ClientId;
        meeting.StartsAt = request.StartsAt;
        meeting.Price = request.Price;

        await _context.SaveChangesAsync(cancellationToken);

        return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
    }

    public async Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken)
    {
        var meeting = await _context.Meetings.FindAsync([meetingId], cancellationToken: cancellationToken);
        if (meeting is null)
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");

        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Meeting deleted" };
    }
}
