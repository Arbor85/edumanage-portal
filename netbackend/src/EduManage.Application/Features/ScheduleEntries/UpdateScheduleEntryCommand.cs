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
                request.Request.IsRecurring, request.Request.DaysOfWeek, request.Request.ValidFrom,
                request.Request.ValidTo, request.Request.Date, request.Request.StartTime, request.Request.EndTime);

            var trainerAvail = await trainerAvailRepo.ListByTrainerAndOrgAsync(request.Request.TrainerUserId, request.OrgId, cancellationToken);
            var buildingAvail = await buildingAvailRepo.ListByBuildingAsync(request.Request.BuildingId, cancellationToken);

            entry.TrainerUserId = request.Request.TrainerUserId;
            entry.BuildingId = request.Request.BuildingId;
            entry.CourseId = request.Request.CourseId;
            entry.IsRecurring = request.Request.IsRecurring;
            entry.DaysOfWeek = [.. (request.Request.DaysOfWeek ?? [])];
            entry.ValidFrom = request.Request.ValidFrom;
            entry.ValidTo = request.Request.ValidTo;
            entry.Date = request.Request.Date;
            entry.StartTime = request.Request.StartTime;
            entry.EndTime = request.Request.EndTime;
            entry.HasMismatch = ScheduleEntryHelpers.ComputeMismatch(create, trainerAvail, buildingAvail);

            await repo.UpdateAsync(entry, cancellationToken);
            return ScheduleEntryHelpers.ToOut(entry);
        }
    }
}
