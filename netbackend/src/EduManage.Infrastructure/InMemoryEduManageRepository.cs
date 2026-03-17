using System.Text.Json.Nodes;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;

namespace EduManage.Infrastructure;

internal sealed class InMemoryEduManageRepository : IEduManageRepository
{
    private readonly object _syncRoot = new();
    private readonly Dictionary<string, PlanOut> _plans = new();
    private readonly Dictionary<string, MeetingOut> _meetings = new();
    private readonly Dictionary<string, CourseOut> _courses = new();
    private readonly Dictionary<string, ClientOut> _clients = new();
    private readonly Dictionary<string, RoutineOut> _routines = new();
    private readonly List<WorkoutHistoryOut> _history = new();

    private readonly IReadOnlyList<ExcerciseOut> _excercises =
    [
        new(1, "Squat", "Back squat pattern", "Quadriceps", [new JsonObject { ["name"] = "Quadriceps" }], ["Legs", "Strength"]),
        new(2, "Bench Press", "Barbell horizontal press", "Chest", [new JsonObject { ["name"] = "Pectorals" }], ["Chest", "Strength"]),
        new(3, "Deadlift", "Hip hinge pull", "Posterior Chain", [new JsonObject { ["name"] = "Hamstrings" }], ["Back", "Strength"])
    ];

    public Task<IReadOnlyList<PlanOut>> ListPlansAsync(CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<IReadOnlyList<PlanOut>>(_plans.Values.ToList());
        }
    }

    public Task<PlanOut> AddPlanAsync(PlanCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var id = NewId();
            var plan = new PlanOut(request.Name, request.ClientId, request.Notes, request.Status, id, ToPlanWorkoutOutput(request.Workouts), FindClientOrNull(request.ClientId));
            _plans[id] = plan;
            return Task.FromResult(plan);
        }
    }

    public Task<PlanOut> GetPlanAsync(string planId, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult(GetPlanById(planId));
        }
    }

    public Task<PlanOut> UpdatePlanAsync(string planId, PlanUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            _ = GetPlanById(planId);
            var plan = new PlanOut(request.Name, request.ClientId, request.Notes, request.Status, planId, ToPlanWorkoutOutput(request.Workouts), FindClientOrNull(request.ClientId));
            _plans[planId] = plan;
            return Task.FromResult(plan);
        }
    }

    public Task<Dictionary<string, string>> DeletePlanAsync(string planId, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_plans.Remove(planId))
            {
                throw new NotFoundException($"Plan '{planId}' was not found.");
            }

            return Task.FromResult(new Dictionary<string, string> { ["detail"] = "Plan deleted" });
        }
    }

    public Task<PlanOut> UpdatePlanStatusAsync(string planId, PlanStatusUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var existing = GetPlanById(planId);
            var updated = existing with { Status = request.Status };
            _plans[planId] = updated;
            return Task.FromResult(updated);
        }
    }

    public Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<IReadOnlyList<MeetingOut>>(_meetings.Values.ToList());
        }
    }

    public Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var id = NewId();
            var meeting = new MeetingOut(request.ClientId, request.StartsAt, request.Price, id, "local-user");
            _meetings[id] = meeting;
            return Task.FromResult(meeting);
        }
    }

    public Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_meetings.ContainsKey(meetingId))
            {
                throw new NotFoundException($"Meeting '{meetingId}' was not found.");
            }

            var meeting = new MeetingOut(request.ClientId, request.StartsAt, request.Price, meetingId, "local-user");
            _meetings[meetingId] = meeting;
            return Task.FromResult(meeting);
        }
    }

    public Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_meetings.Remove(meetingId))
            {
                throw new NotFoundException($"Meeting '{meetingId}' was not found.");
            }

            return Task.FromResult(new Dictionary<string, string> { ["detail"] = "Meeting deleted" });
        }
    }

    public Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<IReadOnlyList<CourseOut>>(_courses.Values.ToList());
        }
    }

    public Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var id = NewId();
            var course = new CourseOut(id, "local-user", request.Name, request.Type, request.Size, request.Price, request.Description);
            _courses[id] = course;
            return Task.FromResult(course);
        }
    }

    public Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_courses.ContainsKey(courseId))
            {
                throw new NotFoundException($"Course '{courseId}' was not found.");
            }

            var course = new CourseOut(courseId, "local-user", request.Name, request.Type, request.Size, request.Price, request.Description);
            _courses[courseId] = course;
            return Task.FromResult(course);
        }
    }

    public Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_courses.Remove(courseId))
            {
                throw new NotFoundException($"Course '{courseId}' was not found.");
            }

            return Task.FromResult(new Dictionary<string, string> { ["detail"] = "Course deleted" });
        }
    }

    public Task<IReadOnlyList<ClientOut>> ListClientsAsync(CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<IReadOnlyList<ClientOut>>(_clients.Values.ToList());
        }
    }

    public Task<ClientOut> AddClientAsync(ClientCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var invitationCode = string.IsNullOrWhiteSpace(request.InvitationCode) ? NewId()[..8] : request.InvitationCode;
            var client = new ClientOut(request.Name, request.Tags, request.ImageUrl, request.Status, invitationCode, null, null);
            _clients[invitationCode] = client;
            return Task.FromResult(client);
        }
    }

    public Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_clients.Remove(invitationCode, out var existing))
            {
                throw new NotFoundException($"Client '{invitationCode}' was not found.");
            }

            var updated = new ClientOut(request.Name, request.Tags, request.ImageUrl, request.Status, request.InvitationCode, existing.UserId, existing.CurrentUserId);
            _clients[updated.InvitationCode] = updated;
            return Task.FromResult(updated);
        }
    }

    public Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_clients.Remove(invitationCode))
            {
                throw new NotFoundException($"Client '{invitationCode}' was not found.");
            }

            return Task.FromResult(new Dictionary<string, string> { ["detail"] = "Client deleted" });
        }
    }

    public Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_clients.TryGetValue(invitationCode, out var existing))
            {
                throw new NotFoundException($"Client '{invitationCode}' was not found.");
            }

            var updated = existing with
            {
                Name = request.Name,
                ImageUrl = request.ImageUrl,
                Status = "Active",
                UserId = request.Email
            };

            _clients[invitationCode] = updated;
            return Task.FromResult(updated);
        }
    }

    public Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(_excercises);
    }

    public Task<IReadOnlyList<RoutineOut>> ListRoutinesAsync(CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<IReadOnlyList<RoutineOut>>(_routines.Values.ToList());
        }
    }

    public Task<RoutineOut> AddRoutineAsync(RoutineCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var id = NewId();
            var routine = new RoutineOut(request.Name, request.Notes, id, "local-user", request.Excercises);
            _routines[id] = routine;
            return Task.FromResult(routine);
        }
    }

    public Task<RoutineOut> UpdateRoutineAsync(string routineId, RoutineUpdate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_routines.ContainsKey(routineId))
            {
                throw new NotFoundException($"Routine '{routineId}' was not found.");
            }

            var routine = new RoutineOut(request.Name, request.Notes, routineId, "local-user", request.Excercises);
            _routines[routineId] = routine;
            return Task.FromResult(routine);
        }
    }

    public Task<Dictionary<string, string>> DeleteRoutineAsync(string routineId, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            if (!_routines.Remove(routineId))
            {
                throw new NotFoundException($"Routine '{routineId}' was not found.");
            }

            return Task.FromResult(new Dictionary<string, string> { ["detail"] = "Routine deleted" });
        }
    }

    public Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken)
    {
        lock (_syncRoot)
        {
            var excercises = request.Excercises?.Count > 0
                ? request.Excercises
                : request.Exercises ?? [];

            var completed = new WorkoutHistoryOut(
                NewId(),
                "local-user",
                request.Mode,
                request.StartedAt,
                request.CompletedAt,
                request.DurationSeconds,
                request.TotalSets,
                request.CompletedSets,
                excercises,
                request.SourceWorkout);

            _history.Add(completed);
            return Task.FromResult(completed);
        }
    }

    private static string NewId() => Guid.NewGuid().ToString("N");

    private PlanOut GetPlanById(string planId)
    {
        if (!_plans.TryGetValue(planId, out var plan))
        {
            throw new NotFoundException($"Plan '{planId}' was not found.");
        }

        return plan;
    }

    private ClientOut? FindClientOrNull(string clientId)
    {
        return _clients.TryGetValue(clientId, out var client) ? client : null;
    }

    private static IReadOnlyList<PlanWorkoutOutput> ToPlanWorkoutOutput(IReadOnlyList<PlanWorkoutInput> workouts)
    {
        return workouts.Select(workout => new PlanWorkoutOutput(workout.Name, workout.Notes, workout.Id, workout.UserId, workout.Excercises, workout.Date)).ToList();
    }
}