using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record ListMeetingsQuery : IRequest<IReadOnlyList<MeetingOut>>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<ListMeetingsQuery, IReadOnlyList<MeetingOut>>
    {
        public async Task<IReadOnlyList<MeetingOut>> Handle(ListMeetingsQuery request, CancellationToken cancellationToken)
        {
            var meetings = await repository.ListAsync(cancellationToken);
            return meetings.Select(m => new MeetingOut(m.ClientId, m.StartsAt, m.Price, m.Id, m.UserId)).ToList();
        }
    }
}