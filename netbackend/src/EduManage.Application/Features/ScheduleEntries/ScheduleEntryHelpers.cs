using EduManage.Application.Contracts;
using TrainerAvailabilityEntity = EduManage.Domain.Entities.TrainerAvailability;
using BuildingAvailabilityEntity = EduManage.Domain.Entities.BuildingAvailability;

namespace EduManage.Application.Features.ScheduleEntries;

internal static class ScheduleEntryHelpers
{
    internal static ScheduleEntryOut ToOut(EduManage.Domain.Entities.ScheduleEntry e) =>
        new(e.Id, e.SchedulePlanId, e.TrainerUserId, e.BuildingId, e.CourseId,
            e.IsRecurring, e.DaysOfWeek, e.ValidFrom, e.ValidTo, e.Date,
            e.StartTime, e.EndTime, e.HasMismatch);

    internal static bool ComputeMismatch(
        ScheduleEntryCreate req,
        IReadOnlyList<TrainerAvailabilityEntity> trainerAvail,
        IReadOnlyList<BuildingAvailabilityEntity> buildingAvail)
    {
        if (req.IsRecurring)
        {
            var days = req.DaysOfWeek ?? [];
            var trainerCovers = trainerAvail.Any(a =>
                days.All(d => a.DaysOfWeek.Contains(d)) &&
                string.Compare(a.StartTime, req.StartTime, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.EndTime, req.EndTime, StringComparison.Ordinal) >= 0 &&
                string.Compare(a.ValidFrom, req.ValidFrom, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.ValidTo, req.ValidTo, StringComparison.Ordinal) >= 0);
            var buildingCovers = buildingAvail.Any(a =>
                days.All(d => a.DaysOfWeek.Contains(d)) &&
                string.Compare(a.StartTime, req.StartTime, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.EndTime, req.EndTime, StringComparison.Ordinal) >= 0 &&
                string.Compare(a.ValidFrom, req.ValidFrom, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.ValidTo, req.ValidTo, StringComparison.Ordinal) >= 0);
            return !trainerCovers || !buildingCovers;
        }
        else
        {
            if (req.Date is null) return true;
            var dayOfWeek = DateTime.Parse(req.Date).DayOfWeek.ToString();
            var trainerCovers = trainerAvail.Any(a =>
                a.DaysOfWeek.Contains(dayOfWeek) &&
                string.Compare(a.StartTime, req.StartTime, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.EndTime, req.EndTime, StringComparison.Ordinal) >= 0 &&
                string.Compare(a.ValidFrom, req.Date, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.ValidTo, req.Date, StringComparison.Ordinal) >= 0);
            var buildingCovers = buildingAvail.Any(a =>
                a.DaysOfWeek.Contains(dayOfWeek) &&
                string.Compare(a.StartTime, req.StartTime, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.EndTime, req.EndTime, StringComparison.Ordinal) >= 0 &&
                string.Compare(a.ValidFrom, req.Date, StringComparison.Ordinal) <= 0 &&
                string.Compare(a.ValidTo, req.Date, StringComparison.Ordinal) >= 0);
            return !trainerCovers || !buildingCovers;
        }
    }
}
