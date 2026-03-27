using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record UpdatePlanCommand(string PlanId, PlanUpdate Request, string CurrentUserId) : IRequest<PlanOut>
{
    internal sealed class Handler(IPlanRepository repository, IClientRepository clientRepository) : IRequestHandler<UpdatePlanCommand, PlanOut>
    {
        public async Task<PlanOut> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
        {
            var plan = await repository.GetByIdAsync(request.PlanId, cancellationToken)
                ?? throw new NotFoundException($"Plan '{request.PlanId}' was not found.");

            if (plan.UserId != request.CurrentUserId)
            {
                throw new UnauthorizedAccessException($"You do not have permission to update plan '{request.PlanId}'.");
            }

            if (!string.IsNullOrWhiteSpace(request.Request.ClientId))
            {
                var targetClient = await clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken)
                    ?? throw new NotFoundException($"Client '{request.Request.ClientId}' was not found.");

                if (targetClient.TrainerUserId != request.CurrentUserId)
                {
                    throw new UnauthorizedAccessException($"You do not have permission to assign plan '{request.PlanId}' to client '{request.Request.ClientId}'.");
                }
            }

            plan.Name = request.Request.Name;
            plan.ClientId = request.Request.ClientId;
            plan.Notes = request.Request.Note;
            plan.Workouts = [.. request.Request.Workouts.Select(w => new PlanWorkout
            {
                Id = w.Id,
                PlanId = plan.Id,
                Name = w.Name,
                Notes = w.Note,
                UserId = request.CurrentUserId,
                Date = w.Date,
                Exercises = [.. w.Excercises.Select(e => new RoutineExercise
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
                })]
            })];

            await repository.UpdateAsync(plan, cancellationToken);
            return ListPlansQuery.Handler.MapToOut(plan);
        }
    }
}