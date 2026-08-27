using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;
using System.Text.Json;
using DomainRoutineSet = EduManage.Domain.Entities.RoutineSet;

namespace EduManage.Application.Features.Routines;

public sealed record AddRoutineCommand(RoutineCreate Request, string CurrentUserId) : IRequest<RoutineOut>
{
    internal sealed class Handler(
        IRoutineRepository repository,
        IUserExercisePreferenceRepository prefRepository)
        : IRequestHandler<AddRoutineCommand, RoutineOut>
    {
        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

        public async Task<RoutineOut> Handle(AddRoutineCommand request, CancellationToken cancellationToken)
        {
            var routine = new Routine
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = request.Request.Name,
                Notes = request.Request.Note,
                UserId = request.CurrentUserId,
                SupersetGroupsJson = JsonSerializer.Serialize(request.Request.SupersetGroups ?? [], SerializerOptions),
                Exercises = request.Request.Excercises.Select(e => new RoutineExercise
                {
                    Name = e.Name,
                    ActivityType = e.ActivityType,
                    ActivityTrackType = e.ActivityTrackType,
                    ExerciseId = e.ExerciseId,
                    SupersetGroupId = e.SupersetGroupId,
                    DropConfigJson = e.DropConfig == null ? null : JsonSerializer.Serialize(e.DropConfig, SerializerOptions),
                    Sets = e.Sets.Select(s => new DomainRoutineSet
                    {
                        Type = s.Type,
                        Reps = s.Reps,
                        Duration = s.Duration,
                        Distance = s.Distance,
                        Weight = s.Weight,
                        Notes = s.Note
                    }).ToList()
                }).ToList()
            };

            await repository.AddAsync(routine, cancellationToken);

            var exerciseIds = request.Request.Excercises
                .Where(e => e.ExerciseId.HasValue)
                .Select(e => e.ExerciseId!.Value)
                .Distinct();

            foreach (var exerciseId in exerciseIds)
                await prefRepository.UpsertAsync(request.CurrentUserId, exerciseId, pref => pref.UsageCount++);

            return ListRoutinesQuery.Handler.MapToOut(routine);
        }
    }
}