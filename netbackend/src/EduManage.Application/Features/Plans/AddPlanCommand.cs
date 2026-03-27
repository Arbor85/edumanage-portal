using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record AddPlanCommand(PlanCreate Request, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository, IClientRepository clientRepository) : IRequestHandler<AddPlanCommand, PlanOut>
    {
        public async Task<PlanOut> Handle(AddPlanCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.Request.ClientId))
            {
                var client = await clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.Request.ClientId}' was not found.");

                if (client.TrainerUserId != request.CurrentUserId)
                {
                    throw new UnauthorizedAccessException($"You do not have permission to create plans for client '{request.Request.ClientId}'.");
                }
            }

            var plan = new Plan
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = request.CurrentUserId,
                Name = request.Request.Name,
                ClientId = request.Request.ClientId,
                Notes = request.Request.Note,
                Status = "Draft",
                Workouts = request.Request.Workouts.Select(w => new PlanWorkout
                {
                    Id = w.Id,
                    Name = w.Name,
                    Notes = w.Note,
                    UserId = request.CurrentUserId,
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