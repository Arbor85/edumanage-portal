using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record DeleteMeetingCommand(string MeetingId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<DeleteMeetingCommand, Dictionary<string, string>>
    {
        public Task<Dictionary<string, string>> Handle(DeleteMeetingCommand request, CancellationToken cancellationToken) =>
            repository.DeleteMeetingAsync(request.MeetingId, cancellationToken);
    }
}