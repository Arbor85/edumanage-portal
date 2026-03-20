using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record AddMeetingCommand(MeetingCreate Request) : IRequest<MeetingOut>
{
    internal sealed class Handler(IMeetingRepository repository) : IRequestHandler<AddMeetingCommand, MeetingOut>
    {
        public async Task<MeetingOut> Handle(AddMeetingCommand request, CancellationToken cancellationToken)
        {
            var meeting = new Meeting
            {
                Id = Guid.NewGuid().ToString("N"),
                ClientId = request.Request.ClientId,
                StartsAt = request.Request.StartsAt,
                Price = request.Request.Price,
                UserId = "local-user"
            };

            await repository.AddAsync(meeting, cancellationToken);
            return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
        }
    }
}