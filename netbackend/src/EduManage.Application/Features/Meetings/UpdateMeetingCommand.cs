using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record UpdateMeetingCommand(string MeetingId, MeetingUpdate Request) : IRequest<MeetingOut>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<UpdateMeetingCommand, MeetingOut>
    {
        public Task<MeetingOut> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken) =>
            repository.UpdateMeetingAsync(request.MeetingId, request.Request, cancellationToken);
    }
}