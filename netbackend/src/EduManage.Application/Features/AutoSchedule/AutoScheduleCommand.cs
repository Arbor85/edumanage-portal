using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.AutoSchedule;

public sealed record AutoScheduleCommand(string OwnerId, string PlanId, AutoScheduleRequest Request) : IRequest<AutoScheduleResult>
{
    internal sealed class Handler(
        IOrganizationRepository orgRepo,
        ITrainerCourseAssociationRepository assocRepo,
        ITrainerAvailabilityRepository trainerAvailRepo,
        IBuildingAvailabilityRepository buildingAvailRepo,
        ICourseRepository courseRepo,
        IScheduleEntryRepository entryRepo)
        : IRequestHandler<AutoScheduleCommand, AutoScheduleResult>
    {
        public async Task<AutoScheduleResult> Handle(AutoScheduleCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");

            var allAssociations = await assocRepo.ListByOrganizationAsync(org.Id, cancellationToken);
            var allTrainerAvail = await trainerAvailRepo.ListByOrgAsync(org.Id, cancellationToken);
            var existingEntries = await entryRepo.ListByPlanAsync(request.PlanId, cancellationToken);

            var scheduled = new List<ScheduleEntryOut>();
            var unscheduled = new List<UnscheduledCourse>();

            var bookedSlots = new List<(string TrainerId, string BuildingId, string Day, string Start, string End)>();

            foreach (var courseId in request.Request.CourseIds)
            {
                var course = await courseRepo.GetByIdAsync(courseId, cancellationToken);
                var courseName = course?.Name ?? courseId;

                var qualifiedTrainers = allAssociations
                    .Where(a => a.CourseId == courseId && request.Request.TrainerIds.Contains(a.TrainerUserId))
                    .Select(a => a.TrainerUserId)
                    .Distinct()
                    .ToList();

                if (qualifiedTrainers.Count == 0)
                {
                    unscheduled.Add(new UnscheduledCourse(courseId, courseName, "No qualified trainer in selection"));
                    continue;
                }

                var trainerLoad = qualifiedTrainers
                    .OrderBy(t => existingEntries.Count(e => e.TrainerUserId == t) + scheduled.Count(s => s.TrainerUserId == t))
                    .ToList();

                bool found = false;
                foreach (var trainerId in trainerLoad)
                {
                    var trainerAvails = allTrainerAvail
                        .Where(a => a.TrainerUserId == trainerId)
                        .OrderBy(a => a.ValidFrom).ThenBy(a => a.StartTime)
                        .ToList();

                    foreach (var buildingId in request.Request.BuildingIds)
                    {
                        var buildingAvails = (await buildingAvailRepo.ListByBuildingAsync(buildingId, cancellationToken))
                            .OrderBy(a => a.ValidFrom).ThenBy(a => a.StartTime)
                            .ToList();

                        foreach (var tSlot in trainerAvails)
                        {
                            foreach (var bSlot in buildingAvails)
                            {
                                var fromMax = string.Compare(tSlot.ValidFrom, bSlot.ValidFrom, StringComparison.Ordinal) >= 0 ? tSlot.ValidFrom : bSlot.ValidFrom;
                                var toMin = string.Compare(tSlot.ValidTo, bSlot.ValidTo, StringComparison.Ordinal) <= 0 ? tSlot.ValidTo : bSlot.ValidTo;
                                if (fromMax != null && toMin != null && string.Compare(fromMax, toMin, StringComparison.Ordinal) > 0) continue;

                                IEnumerable<string> tDays = tSlot.DaysOfWeek.Count > 0 ? tSlot.DaysOfWeek : AllDays;
                                IEnumerable<string> bDays = bSlot.DaysOfWeek.Count > 0 ? bSlot.DaysOfWeek : AllDays;
                                var commonDays = tDays.Intersect(bDays).ToList();
                                if (commonDays.Count == 0) continue;

                                var startMax = string.Compare(tSlot.StartTime, bSlot.StartTime, StringComparison.Ordinal) >= 0 ? tSlot.StartTime : bSlot.StartTime;
                                var endMin = string.Compare(tSlot.EndTime, bSlot.EndTime, StringComparison.Ordinal) <= 0 ? tSlot.EndTime : bSlot.EndTime;
                                if (string.Compare(startMax, endMin, StringComparison.Ordinal) >= 0) continue;

                                foreach (var day in commonDays)
                                {
                                    var trainerConflict =
                                        existingEntries.Any(e => e.TrainerUserId == trainerId && EntryCoversDay(e, day) && TimesOverlap(e.StartTime, e.EndTime, startMax, endMin)) ||
                                        bookedSlots.Any(b => b.TrainerId == trainerId && b.Day == day && TimesOverlap(b.Start, b.End, startMax, endMin));

                                    var buildingConflict =
                                        existingEntries.Any(e => e.BuildingId == buildingId && EntryCoversDay(e, day) && TimesOverlap(e.StartTime, e.EndTime, startMax, endMin)) ||
                                        bookedSlots.Any(b => b.BuildingId == buildingId && b.Day == day && TimesOverlap(b.Start, b.End, startMax, endMin));

                                    if (!trainerConflict && !buildingConflict)
                                    {
                                        bookedSlots.Add((TrainerId: trainerId, BuildingId: buildingId, Day: day, Start: startMax, End: endMin));
                                        var startDate = NextWeekday(day, fromMax);
                                        scheduled.Add(new ScheduleEntryOut(
                                            string.Empty, request.PlanId, trainerId, buildingId, courseId,
                                            startDate, startMax, endMin, "weekly", null, toMin, false));
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) break;
                            }
                            if (found) break;
                        }
                        if (found) break;
                    }
                    if (found) break;
                }

                if (!found)
                {
                    var hasAvail = allTrainerAvail.Any(a => trainerLoad.Contains(a.TrainerUserId));
                    unscheduled.Add(new UnscheduledCourse(courseId, courseName,
                        hasAvail ? "All available slots conflict with existing entries" : "No overlapping availability between trainer and building"));
                }
            }

            return new AutoScheduleResult(scheduled, unscheduled);
        }

        private static readonly string[] AllDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        private static bool EntryCoversDay(ScheduleEntry e, string day)
        {
            if (e.RecurrenceType == "daily") return true;
            if (e.RecurrenceType == "weekly")
                return DateOnly.TryParse(e.StartDate, out var d) && d.DayOfWeek.ToString() == day;
            if (e.RecurrenceType == "none")
                return DateOnly.TryParse(e.StartDate, out var d) && d.DayOfWeek.ToString() == day;
            return false;
        }

        private static string NextWeekday(string dayName, string? fromDate)
        {
            var anchor = fromDate != null && DateOnly.TryParse(fromDate, out var parsed) ? parsed : DateOnly.FromDateTime(DateTime.UtcNow);
            var target = Enum.Parse<DayOfWeek>(dayName);
            var daysUntil = ((int)target - (int)anchor.DayOfWeek + 7) % 7;
            return anchor.AddDays(daysUntil).ToString("yyyy-MM-dd");
        }

        private static bool TimesOverlap(string s1, string e1, string s2, string e2) =>
            string.Compare(s1, e2, StringComparison.Ordinal) < 0 &&
            string.Compare(s2, e1, StringComparison.Ordinal) < 0;
    }
}
