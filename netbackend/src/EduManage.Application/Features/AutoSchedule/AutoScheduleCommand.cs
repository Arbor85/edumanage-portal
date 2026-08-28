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

            // Track what we schedule in this run to detect conflicts within the run
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

                // Sort trainers by fewest existing scheduled entries (most available first)
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

                        // Find overlapping slots
                        foreach (var tSlot in trainerAvails)
                        {
                            foreach (var bSlot in buildingAvails)
                            {
                                // Date range overlap
                                var fromMax = string.Compare(tSlot.ValidFrom, bSlot.ValidFrom, StringComparison.Ordinal) >= 0 ? tSlot.ValidFrom : bSlot.ValidFrom;
                                var toMin = string.Compare(tSlot.ValidTo, bSlot.ValidTo, StringComparison.Ordinal) <= 0 ? tSlot.ValidTo : bSlot.ValidTo;
                                if (string.Compare(fromMax, toMin, StringComparison.Ordinal) > 0) continue;

                                // Day overlap
                                var commonDays = tSlot.DaysOfWeek.Intersect(bSlot.DaysOfWeek).ToList();
                                if (commonDays.Count == 0) continue;

                                // Time overlap
                                var startMax = string.Compare(tSlot.StartTime, bSlot.StartTime, StringComparison.Ordinal) >= 0 ? tSlot.StartTime : bSlot.StartTime;
                                var endMin = string.Compare(tSlot.EndTime, bSlot.EndTime, StringComparison.Ordinal) <= 0 ? tSlot.EndTime : bSlot.EndTime;
                                if (string.Compare(startMax, endMin, StringComparison.Ordinal) >= 0) continue;

                                // Check conflicts against existing entries and current run
                                foreach (var day in commonDays)
                                {
                                    var trainerConflict = existingEntries.Any(e =>
                                        e.TrainerUserId == trainerId && e.IsRecurring &&
                                        e.DaysOfWeek.Contains(day) &&
                                        TimesOverlap(e.StartTime, e.EndTime, startMax, endMin)) ||
                                        bookedSlots.Any(b => b.TrainerId == trainerId && b.Day == day && TimesOverlap(b.Start, b.End, startMax, endMin));

                                    var buildingConflict = existingEntries.Any(e =>
                                        e.BuildingId == buildingId && e.IsRecurring &&
                                        e.DaysOfWeek.Contains(day) &&
                                        TimesOverlap(e.StartTime, e.EndTime, startMax, endMin)) ||
                                        bookedSlots.Any(b => b.BuildingId == buildingId && b.Day == day && TimesOverlap(b.Start, b.End, startMax, endMin));

                                    if (!trainerConflict && !buildingConflict)
                                    {
                                        bookedSlots.Add((trainerId, buildingId, day, startMax, endMin));
                                        scheduled.Add(new ScheduleEntryOut(
                                            string.Empty, request.PlanId, trainerId, buildingId, courseId,
                                            true, [day], fromMax, toMin, null, startMax, endMin, false));
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

        private static bool TimesOverlap(string s1, string e1, string s2, string e2) =>
            string.Compare(s1, e2, StringComparison.Ordinal) < 0 &&
            string.Compare(s2, e1, StringComparison.Ordinal) < 0;
    }
}
