using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using System.Text.Json;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record UpdatePlanCommand(string PlanId, PlanUpdate Request, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(
        IPlanRepository repository,
        IClientRepository clientRepository,
        IMeetingRepository meetingRepository)
        : IRequestHandler<UpdatePlanCommand, PlanOut>
    {
        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

        public async Task<PlanOut> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            if (plan.UserId != request.CurrentUserId)
                throw new UnauthorizedAccessException($"You do not have permission to update plan '{request.PlanId}'.");

            if (!string.IsNullOrWhiteSpace(request.Request.ClientId))
            {
                var targetClient = await clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.Request.ClientId}' was not found.");

                if (targetClient.TrainerUserId != request.CurrentUserId)
                    throw new UnauthorizedAccessException($"You do not have permission to assign plan '{request.PlanId}' to client '{request.Request.ClientId}'.");
            }

            plan.Name = request.Request.Name;
            plan.ClientId = request.Request.ClientId;
            plan.Notes = request.Request.Note;

            var oldMeetingIds = plan.Workouts
                .Where(w => w.MeetingId != null)
                .Select(w => w.MeetingId!)
                .ToHashSet();

            var keptMeetingIds = new HashSet<string>();
            var newWorkouts = new List<PlanWorkout>();

            foreach (var w in request.Request.Workouts)
            {
                string? meetingId = w.MeetingId;
                bool isMeeting = w.IsMeeting && !string.IsNullOrWhiteSpace(plan.ClientId);

                if (isMeeting)
                {
                    var startsAt = BuildStartsAt(w.Date, w.MeetingStartTime);
                    var price = w.MeetingPrice ?? 0;

                    if (meetingId == null)
                    {
                        var meeting = new Meeting
                        {
                            Id = Guid.NewGuid().ToString("N"),
                            ClientId = plan.ClientId!,
                            StartsAt = startsAt,
                            Price = price,
                            UserId = request.CurrentUserId
                        };
                        await meetingRepository.AddAsync(meeting, cancellationToken);
                        meetingId = meeting.Id;
                    }
                    else
                    {
                        var existing = await meetingRepository.GetByIdAsync(meetingId, cancellationToken);
                        if (existing != null)
                        {
                            existing.StartsAt = startsAt;
                            existing.Price = price;
                            await meetingRepository.UpdateAsync(existing, cancellationToken);
                        }
                    }

                    keptMeetingIds.Add(meetingId);
                }
                else if (!isMeeting && meetingId != null)
                {
                    await meetingRepository.DeleteByIdAsync(meetingId, cancellationToken);
                    meetingId = null;
                }

                newWorkouts.Add(new PlanWorkout
                {
                    Id = Guid.NewGuid().ToString("N"),
                    PlanId = plan.Id,
                    Name = w.Name,
                    Notes = w.Note,
                    UserId = request.CurrentUserId,
                    Date = w.Date,
                    SupersetGroupsJson = JsonSerializer.Serialize(w.SupersetGroups ?? [], SerializerOptions),
                    IsMeeting = isMeeting,
                    MeetingId = meetingId,
                    MeetingPrice = w.MeetingPrice,
                    MeetingStartTime = w.MeetingStartTime,
                    Exercises = [.. w.Excercises.Select(e => new RoutineExercise
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
                    })]
                });
            }

            foreach (var orphanId in oldMeetingIds.Except(keptMeetingIds))
                await meetingRepository.DeleteByIdAsync(orphanId, cancellationToken);

            plan.Workouts = newWorkouts;
            await repository.UpdateAsync(plan, cancellationToken);
            return ListPlansQuery.Handler.MapToOut(plan);
        }

        private static string BuildStartsAt(string date, string? time)
        {
            var t = string.IsNullOrWhiteSpace(time) ? "00:00" : time;
            return $"{date}T{t}:00";
        }
    }
}
