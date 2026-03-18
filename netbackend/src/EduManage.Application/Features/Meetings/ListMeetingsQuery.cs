using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record ListMeetingsQuery : IRequest<IReadOnlyList<MeetingOut>>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<ListMeetingsQuery, IReadOnlyList<MeetingOut>>
    {
        public Task<IReadOnlyList<MeetingOut>> Handle(ListMeetingsQuery request, CancellationToken cancellationToken) =>
            repository.ListMeetingsAsync(cancellationToken);
    }
}