using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;

namespace EduManage.Application.Features.Plans;

public sealed record ListPlansQuery(string CurrentUserId) : IRequest<IReadOnlyList<PlanOut>>
{
    internal sealed class Handler(IPlanRepository repository) : IRequestHandler<ListPlansQuery, IReadOnlyList<PlanOut>>
    {
        public async Task<IReadOnlyList<PlanOut>> Handle(ListPlansQuery request, CancellationToken cancellationToken)
        {
            var plans = await repository.Enumerate
                .Where(a =>
                    a.UserId == request.CurrentUserId ||
                    (a.Client != null && a.Client.UserId == request.CurrentUserId && a.Status == "Published"))
                .ToListAsync(cancellationToken);

            return [.. plans.Select(MapToOut)];
        }

        internal static PlanOut MapToOut(Plan plan)
        {
            var workoutOutputs = plan.Workouts.Select(pw => new PlanWorkoutOutput(
                pw.Name, pw.Notes, pw.Id, pw.UserId,
                [.. pw.Exercises.Select(e => new RoutineExcercise(
                    e.Name, e.IsBodyweight,
                    e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Weight, s.Notes)).ToList()
                ))],
                pw.Date)).ToList();

            var clientOut = plan.Client is not null
                ? new ClientOut(plan.Client.Name, plan.Client.Tags, plan.Client.ImageUrl,
                    plan.Client.Status, plan.Client.InvitationCode, plan.Client.TrainerUserId)
                : null;

            return new PlanOut(plan.Name, plan.ClientId, plan.Notes, plan.Status, plan.Id, workoutOutputs, clientOut);
        }
    }
}