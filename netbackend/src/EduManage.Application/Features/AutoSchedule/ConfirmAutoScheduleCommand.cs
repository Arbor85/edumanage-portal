using EduManage.Application.Contracts;
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
                var trainerAvail = await trainerAvailRepo.ListByTrainerAndOrgAsync(req.TrainerUserId, request.OrgId, cancellationToken);
                var buildingAvail = await buildingAvailRepo.ListByBuildingAsync(req.BuildingId, cancellationToken);

                var entry = new ScheduleEntry
                {
                    Id = Guid.NewGuid().ToString("N"),
                    SchedulePlanId = request.PlanId,
                    TrainerUserId = req.TrainerUserId,
                    BuildingId = req.BuildingId,
                    CourseId = req.CourseId,
                    IsRecurring = req.IsRecurring,
                    DaysOfWeek = [.. (req.DaysOfWeek ?? [])],
                    ValidFrom = req.ValidFrom,
                    ValidTo = req.ValidTo,
                    Date = req.Date,
                    StartTime = req.StartTime,
                    EndTime = req.EndTime,
                    HasMismatch = false
                };
                await entryRepo.AddAsync(entry, cancellationToken);
                result.Add(new ScheduleEntryOut(
                    entry.Id, entry.SchedulePlanId, entry.TrainerUserId, entry.BuildingId, entry.CourseId,
                    entry.IsRecurring, entry.DaysOfWeek, entry.ValidFrom, entry.ValidTo,
                    entry.Date, entry.StartTime, entry.EndTime, entry.HasMismatch));
            }
            return result;
        }
    }
}
