using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Meetings;

public sealed record ListMeetingsQuery : IRequest<IReadOnlyList<MeetingOut>>;
public sealed record AddMeetingCommand(MeetingCreate Request) : IRequest<MeetingOut>;
public sealed record UpdateMeetingCommand(string MeetingId, MeetingUpdate Request) : IRequest<MeetingOut>;
public sealed record DeleteMeetingCommand(string MeetingId) : IRequest<Dictionary<string, string>>;

public sealed class ListMeetingsHandler(IMeetingRepository repository) : IRequestHandler<ListMeetingsQuery, IReadOnlyList<MeetingOut>>
{
    public Task<IReadOnlyList<MeetingOut>> Handle(ListMeetingsQuery request, CancellationToken cancellationToken) => repository.ListMeetingsAsync(cancellationToken);
}

public sealed class AddMeetingHandler(IMeetingRepository repository) : IRequestHandler<AddMeetingCommand, MeetingOut>
{
    public Task<MeetingOut> Handle(AddMeetingCommand request, CancellationToken cancellationToken) => repository.AddMeetingAsync(request.Request, cancellationToken);
}

public sealed class UpdateMeetingHandler(IMeetingRepository repository) : IRequestHandler<UpdateMeetingCommand, MeetingOut>
{
    public Task<MeetingOut> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken) => repository.UpdateMeetingAsync(request.MeetingId, request.Request, cancellationToken);
}

public sealed class DeleteMeetingHandler(IMeetingRepository repository) : IRequestHandler<DeleteMeetingCommand, Dictionary<string, string>>
{
    public Task<Dictionary<string, string>> Handle(DeleteMeetingCommand request, CancellationToken cancellationToken) => repository.DeleteMeetingAsync(request.MeetingId, cancellationToken);
}