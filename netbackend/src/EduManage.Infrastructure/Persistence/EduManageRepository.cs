using System.Text.Json.Nodes;
using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;
using DomainCompletedSet = EduManage.Domain.Entities.CompletedSet;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence;

internal sealed class EduManageRepository : IEduManageRepository
{
    private readonly EduManageDbContext _context;

    public EduManageRepository(EduManageDbContext context)
    {
        _context = context;
    }

    // Plans
    public async Task<IReadOnlyList<PlanOut>> ListPlansAsync(CancellationToken cancellationToken)
    {
        var plans = await _context.Plans
            .Include(p => p.Client)
            .Include(p => p.Workouts)
                .ThenInclude(pw => pw.Exercises)
                    .ThenInclude(re => re.Sets)
            .ToListAsync(cancellationToken);

        return plans.Select(p => MapPlanToOut(p)).ToList();
    }

    public async Task<PlanOut> AddPlanAsync(PlanCreate request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([request.ClientId], cancellationToken: cancellationToken);
        
        var plan = new Plan
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = request.Name,
            ClientId = request.ClientId,
            Notes = request.Notes,
            Status = request.Status,
            Client = client
        };

        var workouts = request.Workouts.Select(w => new PlanWorkout
        {
            Id = w.Id,
            PlanId = plan.Id,
            Name = w.Name,
            Notes = w.Notes,
            UserId = w.UserId,
            Date = w.Date,
            Exercises = w.Excercises.Select(e => new RoutineExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainRoutineSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Notes
                }).ToList()
            }).ToList()
        }).ToList();

        plan.Workouts = workouts;
        _context.Plans.Add(plan);
        await _context.SaveChangesAsync(cancellationToken);

        return MapPlanToOut(plan);
    }

    public async Task<PlanOut> GetPlanAsync(string planId, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans
            .Include(p => p.Client)
            .Include(p => p.Workouts)
                .ThenInclude(pw => pw.Exercises)
                    .ThenInclude(re => re.Sets)
            .FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);

        if (plan is null)
            throw new NotFoundException($"Plan '{planId}' was not found.");

        return MapPlanToOut(plan);
    }

    public async Task<PlanOut> UpdatePlanAsync(string planId, PlanUpdate request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans
            .Include(p => p.Client)
            .Include(p => p.Workouts)
                .ThenInclude(pw => pw.Exercises)
                    .ThenInclude(re => re.Sets)
            .FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);

        if (plan is null)
            throw new NotFoundException($"Plan '{planId}' was not found.");

        plan.Name = request.Name;
        plan.ClientId = request.ClientId;
        plan.Notes = request.Notes;
        plan.Status = request.Status;

        // Remove old workouts
        _context.PlanWorkouts.RemoveRange(plan.Workouts);

        // Add new workouts
        var workouts = request.Workouts.Select(w => new PlanWorkout
        {
            Id = w.Id,
            PlanId = plan.Id,
            Name = w.Name,
            Notes = w.Notes,
            UserId = w.UserId,
            Date = w.Date,
            Exercises = w.Excercises.Select(e => new RoutineExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainRoutineSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Notes
                }).ToList()
            }).ToList()
        }).ToList();

        plan.Workouts = workouts;
        await _context.SaveChangesAsync(cancellationToken);

        return MapPlanToOut(plan);
    }

    public async Task<Dictionary<string, string>> DeletePlanAsync(string planId, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([planId], cancellationToken: cancellationToken);
        if (plan is null)
            throw new NotFoundException($"Plan '{planId}' was not found.");

        _context.Plans.Remove(plan);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Plan deleted" };
    }

    public async Task<PlanOut> UpdatePlanStatusAsync(string planId, PlanStatusUpdate request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans
            .Include(p => p.Client)
            .Include(p => p.Workouts)
                .ThenInclude(pw => pw.Exercises)
                    .ThenInclude(re => re.Sets)
            .FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);

        if (plan is null)
            throw new NotFoundException($"Plan '{planId}' was not found.");

        plan.Status = request.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return MapPlanToOut(plan);
    }

    // Meetings
    public async Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken)
    {
        var meetings = await _context.Meetings.ToListAsync(cancellationToken);
        return meetings.Select(m => new MeetingOut(m.ClientId, m.StartsAt, m.Price, m.Id, m.UserId)).ToList();
    }

    public async Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken)
    {
        var meeting = new Meeting
        {
            Id = Guid.NewGuid().ToString("N"),
            ClientId = request.ClientId,
            StartsAt = request.StartsAt,
            Price = request.Price,
            UserId = "local-user"
        };

        _context.Meetings.Add(meeting);
        await _context.SaveChangesAsync(cancellationToken);

        return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
    }

    public async Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken)
    {
        var meeting = await _context.Meetings.FindAsync([meetingId], cancellationToken: cancellationToken);
        if (meeting is null)
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");

        meeting.ClientId = request.ClientId;
        meeting.StartsAt = request.StartsAt;
        meeting.Price = request.Price;

        await _context.SaveChangesAsync(cancellationToken);

        return new MeetingOut(meeting.ClientId, meeting.StartsAt, meeting.Price, meeting.Id, meeting.UserId);
    }

    public async Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken)
    {
        var meeting = await _context.Meetings.FindAsync([meetingId], cancellationToken: cancellationToken);
        if (meeting is null)
            throw new NotFoundException($"Meeting '{meetingId}' was not found.");

        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Meeting deleted" };
    }

    // Courses
    public async Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken)
    {
        var courses = await _context.Courses.ToListAsync(cancellationToken);
        return courses.Select(c => new CourseOut(
            c.Id,
            c.UserId,
            c.Name,
            c.Type,
            c.Size,
            new CoursePrice(c.PriceValue, c.PriceCurrency),
            c.Description
        )).ToList();
    }

    public async Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken)
    {
        var course = new Course
        {
            Id = Guid.NewGuid().ToString("N"),
            UserId = "local-user",
            Name = request.Name,
            Type = request.Type,
            Size = request.Size,
            PriceValue = request.Price.Value,
            PriceCurrency = request.Price.Currency,
            Description = request.Description
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync(cancellationToken);

        return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size, 
            new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
    }

    public async Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses.FindAsync([courseId], cancellationToken: cancellationToken);
        if (course is null)
            throw new NotFoundException($"Course '{courseId}' was not found.");

        course.Name = request.Name;
        course.Type = request.Type;
        course.Size = request.Size;
        course.PriceValue = request.Price.Value;
        course.PriceCurrency = request.Price.Currency;
        course.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);

        return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size,
            new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
    }

    public async Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken)
    {
        var course = await _context.Courses.FindAsync([courseId], cancellationToken: cancellationToken);
        if (course is null)
            throw new NotFoundException($"Course '{courseId}' was not found.");

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Course deleted" };
    }

    // Clients
    public async Task<IReadOnlyList<ClientOut>> ListClientsAsync(CancellationToken cancellationToken)
    {
        var clients = await _context.Clients.ToListAsync(cancellationToken);
        return clients.Select(c => new ClientOut(c.Name, c.Tags, c.ImageUrl, c.Status, c.InvitationCode, c.UserId, null)).ToList();
    }

    public async Task<ClientOut> AddClientAsync(ClientCreate request, CancellationToken cancellationToken)
    {
        var invitationCode = string.IsNullOrWhiteSpace(request.InvitationCode) 
            ? Guid.NewGuid().ToString("N")[..8] 
            : request.InvitationCode;

        var client = new Client
        {
            InvitationCode = invitationCode,
            Name = request.Name,
            Tags = request.Tags.ToList(),
            ImageUrl = request.ImageUrl,
            Status = request.Status
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }

    public async Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        client.Name = request.Name;
        client.Tags = request.Tags.ToList();
        client.ImageUrl = request.ImageUrl;
        client.Status = request.Status;
        client.InvitationCode = request.InvitationCode;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }

    public async Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Client deleted" };
    }

    public async Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FindAsync([invitationCode], cancellationToken: cancellationToken);
        if (client is null)
            throw new NotFoundException($"Client '{invitationCode}' was not found.");

        client.Name = request.Name;
        client.ImageUrl = request.ImageUrl;
        client.Status = "Active";
        client.UserId = request.Email;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.UserId, null);
    }

    // Exercises
    public async Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken)
    {
        var exercises = await _context.Exercises.ToListAsync(cancellationToken);
        return exercises.Select(e => new ExcerciseOut(
            e.Id,
            e.Name,
            e.ShortDescription,
            e.PrimaryMuscle,
            ParseJsonObjects(e.MusclesJson),
            e.Tags
        )).ToList();
    }

    // Routines
    public async Task<IReadOnlyList<RoutineOut>> ListRoutinesAsync(CancellationToken cancellationToken)
    {
        var routines = await _context.Routines
            .Include(r => r.Exercises)
                .ThenInclude(re => re.Sets)
            .ToListAsync(cancellationToken);

        return routines.Select(r => MapRoutineToOut(r)).ToList();
    }

    public async Task<RoutineOut> AddRoutineAsync(RoutineCreate request, CancellationToken cancellationToken)
    {
        var routine = new Routine
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = request.Name,
            Notes = request.Notes,
            UserId = "local-user",
            Exercises = request.Excercises.Select(e => new RoutineExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainRoutineSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Notes
                }).ToList()
            }).ToList()
        };

        _context.Routines.Add(routine);
        await _context.SaveChangesAsync(cancellationToken);

        return MapRoutineToOut(routine);
    }

    public async Task<RoutineOut> UpdateRoutineAsync(string routineId, RoutineUpdate request, CancellationToken cancellationToken)
    {
        var routine = await _context.Routines
            .Include(r => r.Exercises)
                .ThenInclude(re => re.Sets)
            .FirstOrDefaultAsync(r => r.Id == routineId, cancellationToken);

        if (routine is null)
            throw new NotFoundException($"Routine '{routineId}' was not found.");

        routine.Name = request.Name;
        routine.Notes = request.Notes;

        _context.RoutineExercises.RemoveRange(routine.Exercises);
        routine.Exercises = request.Excercises.Select(e => new RoutineExercise
        {
            Name = e.Name,
            IsBodyweight = e.IsBodyweight,
            Sets = e.Sets.Select(s => new DomainRoutineSet
            {
                Type = s.Type,
                Reps = s.Reps,
                Weight = s.Weight,
                Notes = s.Notes
            }).ToList()
        }).ToList();

        await _context.SaveChangesAsync(cancellationToken);

        return MapRoutineToOut(routine);
    }

    public async Task<Dictionary<string, string>> DeleteRoutineAsync(string routineId, CancellationToken cancellationToken)
    {
        var routine = await _context.Routines.FindAsync([routineId], cancellationToken: cancellationToken);
        if (routine is null)
            throw new NotFoundException($"Routine '{routineId}' was not found.");

        _context.Routines.Remove(routine);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Routine deleted" };
    }

    public async Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken)
    {
        var excercises = request.Excercises?.Count > 0
            ? request.Excercises
            : request.Exercises ?? [];

        var sourceWorkout = new SourceWorkout
        {
            WorkoutId = request.SourceWorkout.Id,
            Name = request.SourceWorkout.Name,
            Date = request.SourceWorkout.Date
        };

        var workoutHistory = new WorkoutHistory
        {
            Id = Guid.NewGuid().ToString("N"),
            CurrentUserId = "local-user",
            Mode = request.Mode,
            StartedAt = request.StartedAt,
            CompletedAt = request.CompletedAt,
            DurationSeconds = request.DurationSeconds,
            TotalSets = request.TotalSets,
            CompletedSets = request.CompletedSets,
            SourceWorkout = sourceWorkout,
            Exercises = excercises.Select(e => new CompletedExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainCompletedSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Notes,
                    Completed = s.Completed
                }).ToList()
            }).ToList()
        };

        _context.WorkoutHistory.Add(workoutHistory);
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkoutHistoryOut(
            workoutHistory.Id,
            workoutHistory.CurrentUserId,
            workoutHistory.Mode,
            workoutHistory.StartedAt,
            workoutHistory.CompletedAt,
            workoutHistory.DurationSeconds,
            workoutHistory.TotalSets,
            workoutHistory.CompletedSets,
            excercises,
            request.SourceWorkout
        );
    }

    // Helpers
    private static PlanOut MapPlanToOut(Plan plan)
    {
        var workoutOutputs = plan.Workouts.Select(pw => new PlanWorkoutOutput(
            pw.Name,
            pw.Notes,
            pw.Id,
            pw.UserId,
            pw.Exercises.Select(e => new RoutineExcercise(
                e.Name,
                e.IsBodyweight,
                e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Weight, s.Notes)).ToList()
            )).ToList(),
            pw.Date
        )).ToList();

        var clientOut = plan.Client is not null
            ? new ClientOut(plan.Client.Name, plan.Client.Tags, plan.Client.ImageUrl, 
                plan.Client.Status, plan.Client.InvitationCode, plan.Client.UserId, null)
            : null;

        return new PlanOut(plan.Name, plan.ClientId, plan.Notes, plan.Status, plan.Id, workoutOutputs, clientOut);
    }

    private static RoutineOut MapRoutineToOut(Routine routine)
    {
        var excercises = routine.Exercises.Select(e => new RoutineExcercise(
            e.Name,
            e.IsBodyweight,
            e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Weight, s.Notes)).ToList()
        )).ToList();

        return new RoutineOut(routine.Name, routine.Notes, routine.Id, routine.UserId, excercises);
    }

    private static IReadOnlyList<JsonObject> ParseJsonObjects(string json)
    {
        try
        {
            var parsed = JsonNode.Parse(json);
            if (parsed is JsonArray arr)
            {
                return arr.OfType<JsonObject>().ToList();
            }
        }
        catch { }

        return [];
    }
}
