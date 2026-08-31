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
                StartDate = request.Request.StartDate,
                StartTime = request.Request.StartTime,
                EndTime = request.Request.EndTime,
                RecurrenceType = request.Request.RecurrenceType,
                RecurrenceInterval = request.Request.RecurrenceInterval,
                ValidUntil = request.Request.ValidUntil,
                HasMismatch = hasMismatch
            };
            await repo.AddAsync(entry, cancellationToken);
            return ScheduleEntryHelpers.ToOut(entry);
        }
    }
}
