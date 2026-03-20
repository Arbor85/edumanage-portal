using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record DeleteMeetingCommand(string MeetingId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<DeleteMeetingCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteMeetingCommand request, CancellationToken cancellationToken)
        {
            await repository.DeleteByIdAsync(request.MeetingId, cancellationToken);
            return new Dictionary<string, string> { ["detail"] = "Meeting deleted" };
        }
    }
}