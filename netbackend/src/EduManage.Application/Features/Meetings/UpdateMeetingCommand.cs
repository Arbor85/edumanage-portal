using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record UpdateMeetingCommand(string MeetingId, MeetingUpdate Request) : IRequest<MeetingOut>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<UpdateMeetingCommand, MeetingOut>
    {
        public async Task<MeetingOut> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken)
        {
            var meeting = await repository.GetByIdAsync(request.MeetingId, cancellationToken)
                ?? throw new NotFoundException($"Meeting '{request.MeetingId}' was not found.");

            meeting.ClientId = request.Request.ClientId;
            meeting.StartsAt = request.Request.StartsAt;
            meeting.Price = request.Request.Price;

            await repository.UpdateAsync(meeting, cancellationToken);
            return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
        }
    }
}