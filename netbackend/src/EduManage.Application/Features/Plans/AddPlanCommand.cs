using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record AddPlanCommand(PlanCreate Request) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<AddPlanCommand, PlanOut>
    {
        public async Task<PlanOut> Handle(AddPlanCommand request, CancellationToken cancellationToken)
        {
            var plan = new Plan
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                ClientId = request.Request.ClientId,
                Notes = request.Request.Note,
                Status = request.Request.Status,
                Workouts = request.Request.Workouts.Select(w => new PlanWorkout
                {
                    Id = w.Id,
                    Name = w.Name,
                    Notes = w.Note,
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
                            Notes = s.Note
                        }).ToList()
                    }).ToList()
                }).ToList()
            };

            await repository.AddAsync(plan, cancellationToken);
            return ListPlansQuery.Handler.MapToOut(plan);
        }
    }
}