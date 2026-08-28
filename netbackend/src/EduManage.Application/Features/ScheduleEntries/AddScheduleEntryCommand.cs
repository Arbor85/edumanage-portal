using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.ScheduleEntries;

public sealed record AddScheduleEntryCommand(
    string PlanId,
    string OrgId,
    ScheduleEntryCreate Request) : IRequest<ScheduleEntryOut>
{
    internal sealed class Handler(
        IScheduleEntryRepository repo,
        ITrainerAvailabilityRepository trainerAvailRepo,
        IBuildingAvailabilityRepository buildingAvailRepo)
        : IRequestHandler<AddScheduleEntryCommand, ScheduleEntryOut>
    {
        public async Task<ScheduleEntryOut> Handle(AddScheduleEntryCommand request, CancellationToken cancellationToken)
        {
            var trainerAvail = await trainerAvailRepo.ListByTrainerAndOrgAsync(request.Request.TrainerUserId, request.OrgId, cancellationToken);
            var buildingAvail = await buildingAvailRepo.ListByBuildingAsync(request.Request.BuildingId, cancellationToken);
            var hasMismatch = ScheduleEntryHelpers.ComputeMismatch(request.Request, trainerAvail, buildingAvail);

            var entry = new ScheduleEntry
            {
                Id = Guid.NewGuid().ToString("N"),
                SchedulePlanId = request.PlanId,
                TrainerUserId = request.Request.TrainerUserId,
                BuildingId = request.Request.BuildingId,
                CourseId = request.Request.CourseId,
                IsRecurring = request.Request.IsRecurring,
                DaysOfWeek = [.. (request.Request.DaysOfWeek ?? [])],
                ValidFrom = request.Request.ValidFrom,
                ValidTo = request.Request.ValidTo,
                Date = request.Request.Date,
                StartTime = request.Request.StartTime,
                EndTime = request.Request.EndTime,
                HasMismatch = hasMismatch
            };
            await repo.AddAsync(entry, cancellationToken);
            return ScheduleEntryHelpers.ToOut(entry);
        }
    }
}
