using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record AddMeetingCommand(MeetingCreate Request) : IRequest<MeetingOut>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<AddMeetingCommand, MeetingOut>
    {
        public Task<MeetingOut> Handle(AddMeetingCommand request, CancellationToken cancellationToken) =>
            repository.AddMeetingAsync(request.Request, cancellationToken);
    }
}