using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using System.Text.Json;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record AddPlanCommand(PlanCreate Request, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(
        IPlanRepository repository,
        IClientRepository clientRepository,
        IMeetingRepository meetingRepository)
        : IRequestHandler<AddPlanCommand, PlanOut>
    {
        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

        public async Task<PlanOut> Handle(AddPlanCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.Request.ClientId))
            {
                var client = await clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.Request.ClientId}' was not found.");

                if (client.TrainerUserId != request.CurrentUserId)
                    throw new UnauthorizedAccessException($"You do not have permission to create plans for client '{request.Request.ClientId}'.");
            }

            var workouts = new List<PlanWorkout>();

            foreach (var w in request.Request.Workouts)
            {
                string? meetingId = null;
                bool isMeeting = w.IsMeeting && !string.IsNullOrWhiteSpace(request.Request.ClientId);

                if (isMeeting)
                {
                    var meeting = new Meeting
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        ClientId = request.Request.ClientId!,
                        StartsAt = BuildStartsAt(w.Date, w.MeetingStartTime),
                        Price = w.MeetingPrice ?? 0,
                        UserId = request.CurrentUserId
                    };
                    await meetingRepository.AddAsync(meeting, cancellationToken);
                    meetingId = meeting.Id;
                }

                workouts.Add(new PlanWorkout
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = w.Name,
                    Notes = w.Note,
                    UserId = request.CurrentUserId,
                    Date = w.Date,
                    SupersetGroupsJson = JsonSerializer.Serialize(w.SupersetGroups ?? [], SerializerOptions),
                    IsMeeting = isMeeting,
                    MeetingId = meetingId,
                    MeetingPrice = w.MeetingPrice,
                    MeetingStartTime = w.MeetingStartTime,
                    Exercises = w.Excercises.Select(e => new RoutineExercise
                    {
                        Name = e.Name,
                        ActivityType = e.ActivityType,
                        ActivityTrackType = e.ActivityTrackType,
                        SupersetGroupId = e.SupersetGroupId,
                        DropConfigJson = e.DropConfig == null ? null : JsonSerializer.Serialize(e.DropConfig, SerializerOptions),
                        Sets = e.Sets.Select(s => new DomainRoutineSet
                        {
                            Type = s.Type,
                            Reps = s.Reps,
                            Duration = s.Duration,
                            Distance = s.Distance,
                            Weight = s.Weight,
                            Notes = s.Note
                        }).ToList()
                    }).ToList()
                });
            }

            var plan = new Plan
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = request.CurrentUserId,
                Name = request.Request.Name,
                ClientId = request.Request.ClientId,
                Notes = request.Request.Note,
                Status = "Draft",
                Workouts = workouts
            };

            await repository.AddAsync(plan, cancellationToken);
            return ListPlansQuery.Handler.MapToOut(plan);
        }

        private static string BuildStartsAt(string date, string? time)
        {
            var t = string.IsNullOrWhiteSpace(time) ? "00:00" : time;
            return $"{date}T{t}:00";
        }
    }
}
