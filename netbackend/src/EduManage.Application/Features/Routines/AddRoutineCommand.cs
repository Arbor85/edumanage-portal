using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Routines;

public sealed record AddRoutineCommand(RoutineCreate Request) : IRequest<RoutineOut>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<AddRoutineCommand, RoutineOut>
    {
        public async Task<RoutineOut> Handle(AddRoutineCommand request, CancellationToken cancellationToken)
        {
            var routine = new Routine
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                Notes = request.Request.Notes,
                UserId = "local-user",
                Exercises = request.Request.Excercises.Select(e => new RoutineExercise
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

            await repository.AddAsync(routine, cancellationToken);
            return ListRoutinesQuery.Handler.MapToOut(routine);
        }
    }
}