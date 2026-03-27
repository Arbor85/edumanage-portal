using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Routines;

public sealed record UpdateRoutineCommand(string RoutineId, RoutineUpdate Request, string CurrentUserId) : IRequest<RoutineOut>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<UpdateRoutineCommand, RoutineOut>
    {
        public async Task<RoutineOut> Handle(UpdateRoutineCommand request, CancellationToken cancellationToken)
        {
            var routine = await repository.GetByIdAsync(request.RoutineId, cancellationToken)
                ?? throw new NotFoundException($"Routine '{request.RoutineId}' was not found.");

            if (routine.UserId != request.CurrentUserId)
            {
                throw new UnauthorizedAccessException($"You do not have permission to update routine '{request.RoutineId}'.");
            }

            routine.Name = request.Request.Name;
            routine.Notes = request.Request.Note;
            routine.Exercises = request.Request.Excercises.Select(e => new RoutineExercise
            {
                Name = e.Name,
                IsBodyweight = e.IsBodyweight,
                Sets = e.Sets.Select(s => new DomainRoutineSet
                {
                    Type = s.Type,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    Notes = s.Note
                }).ToList()
            }).ToList();

            await repository.UpdateAsync(routine, cancellationToken);
            return ListRoutinesQuery.Handler.MapToOut(routine);
        }
    }
}