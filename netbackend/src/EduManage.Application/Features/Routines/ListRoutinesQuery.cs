using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using System.Text.Json;
using ContractsRoutineSet = EduManage.Application.Contracts.RoutineSet;
using ContractsRunConfig = EduManage.Application.Contracts.RunConfig;

namespace EduManage.Application.Features.Routines;

public sealed record ListRoutinesQuery(string CurrentUserId) : IRequest<IReadOnlyList<RoutineOut>>
{
    internal sealed class Handler(IRoutineRepository repository) : IRequestHandler<ListRoutinesQuery, IReadOnlyList<RoutineOut>>
    {
        public async Task<IReadOnlyList<RoutineOut>> Handle(ListRoutinesQuery request, CancellationToken cancellationToken)
        {
            var routines = await repository.Enumerate
                .Where(r => r.UserId == request.CurrentUserId)
                .ToListAsync(cancellationToken);

            return routines.Select(MapToOut).ToList();
        }

        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

        internal static RoutineOut MapToOut(Routine routine) =>
            new(routine.Name, routine.Notes, routine.Id, routine.UserId,
                routine.Exercises.Select(e => new RoutineExcercise(
                    e.Name,
                    e.ActivityType,
                    e.ActivityTrackType,
                    e.Sets.Select(s => new ContractsRoutineSet(s.Type, s.Reps, s.Duration, s.Distance, s.Weight, s.Notes)).ToList(),
                    e.SupersetGroupId,
                    e.DropConfigJson == null ? null : JsonSerializer.Deserialize<DropConfig>(e.DropConfigJson, SerializerOptions),
                    e.ExerciseId,
                    e.RunConfigJson == null ? null : JsonSerializer.Deserialize<ContractsRunConfig>(e.RunConfigJson, SerializerOptions)
                )).ToList(),
                JsonSerializer.Deserialize<List<SupersetGroup>>(routine.SupersetGroupsJson, SerializerOptions) ?? []);
    }
}