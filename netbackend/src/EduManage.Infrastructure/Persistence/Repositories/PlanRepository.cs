using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class PlanRepository : IPlanRepository
{
    private readonly EduManageDbContext _context;

    public PlanRepository(EduManageDbContext context)
    {
        _context = context;
    }

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
}
