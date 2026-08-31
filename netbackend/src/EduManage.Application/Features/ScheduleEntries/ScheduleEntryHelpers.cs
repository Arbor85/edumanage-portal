using EduManage.Application.Contracts;
using TrainerAvailabilityEntity = EduManage.Domain.Entities.TrainerAvailability;
using BuildingAvailabilityEntity = EduManage.Domain.Entities.BuildingAvailability;

namespace EduManage.Application.Features.ScheduleEntries;

internal static class ScheduleEntryHelpers
{
    internal static ScheduleEntryOut ToOut(EduManage.Domain.Entities.ScheduleEntry e) =>
        new(e.Id, e.SchedulePlanId, e.TrainerUserId, e.BuildingId, e.CourseId,
            e.StartDate, e.StartTime, e.EndTime, e.RecurrenceType, e.RecurrenceInterval, e.ValidUntil, e.HasMismatch);

    internal static bool ComputeMismatch(
        ScheduleEntryCreate req,
        IReadOnlyList<TrainerAvailabilityEntity> trainerAvail,
        IReadOnlyList<BuildingAvailabilityEntity> buildingAvail)
    {
        var startDate = DateOnly.Parse(req.StartDate);
        var dayOfWeek = startDate.DayOfWeek.ToString();

        bool DateRangeCovers(string? slotValidFrom, string? slotValidTo)
        {
            if (slotValidFrom != null && string.Compare(slotValidFrom, req.StartDate, StringComparison.Ordinal) > 0) return false;
            if (slotValidTo != null && req.ValidUntil != null && string.Compare(slotValidTo, req.ValidUntil, StringComparison.Ordinal) < 0) return false;
            return true;
        }

        bool TimeRangeCovers(string slotStart, string slotEnd) =>
            string.Compare(slotStart, req.StartTime, StringComparison.Ordinal) <= 0 &&
            string.Compare(slotEnd, req.EndTime, StringComparison.Ordinal) >= 0;

        bool DayCovers(IReadOnlyList<string> days) =>
            days.Count == 0 || days.Contains(dayOfWeek);

        var trainerCovers = trainerAvail.Any(a =>
            DayCovers(a.DaysOfWeek) && TimeRangeCovers(a.StartTime, a.EndTime) && DateRangeCovers(a.ValidFrom, a.ValidTo));

        var buildingCovers = buildingAvail.Any(a =>
            DayCovers(a.DaysOfWeek) && TimeRangeCovers(a.StartTime, a.EndTime) && DateRangeCovers(a.ValidFrom, a.ValidTo));

        return !trainerCovers || !buildingCovers;
    }
}
