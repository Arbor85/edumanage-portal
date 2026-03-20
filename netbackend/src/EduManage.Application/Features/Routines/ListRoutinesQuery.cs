using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;

namespace EduManage.Application.Features.Routines;

public sealed record ListRoutinesQuery : IRequest<IReadOnlyList<RoutineOut>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<ListRoutinesQuery, IReadOnlyList<RoutineOut>>
    {
        public async Task<IReadOnlyList<RoutineOut>> Handle(ListRoutinesQuery request, CancellationToken cancellationToken)
        {
            var routines = await repository.ListAsync(cancellationToken);
            return routines.Select(MapToOut).ToList();
        }

        internal static RoutineOut MapToOut(Routine routine) =>
            new(routine.Name, routine.Notes, routine.Id, routine.UserId,
                routine.Exercises.Select(e => new RoutineExcercise(
                    e.Name, e.IsBodyweight,
                    e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Weight, s.Notes)).ToList()
                )).ToList());
    }
}