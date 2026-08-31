using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.ScheduleEntries;

public sealed record UpdateScheduleEntryCommand(
    string EntryId,
    string OrgId,
    ScheduleEntryUpdate Request) : IRequest<ScheduleEntryOut>
{
    internal sealed class Handler(
        IScheduleEntryRepository repo,
        ITrainerAvailabilityRepository trainerAvailRepo,
        IBuildingAvailabilityRepository buildingAvailRepo)
        : IRequestHandler<UpdateScheduleEntryCommand, ScheduleEntryOut>
    {
        public async Task<ScheduleEntryOut> Handle(UpdateScheduleEntryCommand request, CancellationToken cancellationToken)
        {
            var entry = await repo.GetByIdAsync(request.EntryId, cancellationToken)
                ?? throw new NotFoundException($"Schedule entry '{request.EntryId}' not found.");

            var create = new ScheduleEntryCreate(
                request.Request.TrainerUserId, request.Request.BuildingId, request.Request.CourseId,
                request.Request.StartDate, request.Request.StartTime, request.Request.EndTime,
                request.Request.RecurrenceType, request.Request.RecurrenceInterval, request.Request.ValidUntil);

            var trainerAvail = await trainerAvailRepo.ListByTrainerAndOrgAsync(request.Request.TrainerUserId, request.OrgId, cancellationToken);
            var buildingAvail = await buildingAvailRepo.ListByBuildingAsync(request.Request.BuildingId, cancellationToken);

            entry.TrainerUserId = request.Request.TrainerUserId;
            entry.BuildingId = request.Request.BuildingId;
            entry.CourseId = request.Request.CourseId;
            entry.StartDate = request.Request.StartDate;
            entry.StartTime = request.Request.StartTime;
            entry.EndTime = request.Request.EndTime;
            entry.RecurrenceType = request.Request.RecurrenceType;
            entry.RecurrenceInterval = request.Request.RecurrenceInterval;
            entry.ValidUntil = request.Request.ValidUntil;
            entry.HasMismatch = ScheduleEntryHelpers.ComputeMismatch(create, trainerAvail, buildingAvail);

            await repo.UpdateAsync(entry, cancellationToken);
            return ScheduleEntryHelpers.ToOut(entry);
        }
    }
}
