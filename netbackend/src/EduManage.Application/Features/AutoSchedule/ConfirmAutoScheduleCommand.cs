using EduManage.Application.Contracts;
using EduManage.Application.Features.ScheduleEntries;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.AutoSchedule;

public sealed record ConfirmAutoScheduleCommand(string PlanId, string OrgId, ConfirmAutoScheduleRequest Request) : IRequest<IReadOnlyList<ScheduleEntryOut>>
{
    internal sealed class Handler(
        IScheduleEntryRepository entryRepo,
        ITrainerAvailabilityRepository trainerAvailRepo,
        IBuildingAvailabilityRepository buildingAvailRepo)
        : IRequestHandler<ConfirmAutoScheduleCommand, IReadOnlyList<ScheduleEntryOut>>
    {
        public async Task<IReadOnlyList<ScheduleEntryOut>> Handle(ConfirmAutoScheduleCommand request, CancellationToken cancellationToken)
        {
            await entryRepo.DeleteAllByPlanAsync(request.PlanId, cancellationToken);

            var result = new List<ScheduleEntryOut>();
            foreach (var req in request.Request.Entries)
            {
                var entry = new ScheduleEntry
                {
                    Id = Guid.NewGuid().ToString("N"),
                    SchedulePlanId = request.PlanId,
                    TrainerUserId = req.TrainerUserId,
                    BuildingId = req.BuildingId,
                    CourseId = req.CourseId,
                    StartDate = req.StartDate,
                    StartTime = req.StartTime,
                    EndTime = req.EndTime,
                    RecurrenceType = req.RecurrenceType,
                    RecurrenceInterval = req.RecurrenceInterval,
                    ValidUntil = req.ValidUntil,
                    HasMismatch = false
                };
                await entryRepo.AddAsync(entry, cancellationToken);
                result.Add(ScheduleEntryHelpers.ToOut(entry));
            }
            return result;
        }
    }
}
