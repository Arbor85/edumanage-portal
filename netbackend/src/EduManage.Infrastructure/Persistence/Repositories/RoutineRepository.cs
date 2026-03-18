using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class RoutineRepository : IRoutineRepository
{
    private readonly EduManageDbContext _context;

    public RoutineRepository(EduManageDbContext context)
    {
        _context = context;
    }

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

    private static RoutineOut MapRoutineToOut(Routine routine)
    {
        var excercises = routine.Exercises.Select(e => new RoutineExcercise(
            e.Name,
            e.IsBodyweight,
            e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Weight, s.Notes)).ToList()
        )).ToList();

        return new RoutineOut(routine.Name, routine.Notes, routine.Id, routine.UserId, excercises);
    }
}
