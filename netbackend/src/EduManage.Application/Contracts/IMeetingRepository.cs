namespace EduManage.Application.Contracts;

public interface IMeetingRepository
{
    Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken);
    Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken);
    Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken);
}
