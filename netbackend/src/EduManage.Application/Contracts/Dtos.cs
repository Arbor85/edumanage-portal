using EduManage.Domain.Entities;
using System.Text.Json.Serialization;

namespace EduManage.Application.Contracts;

public sealed record AcceptClientInvitationRequest(string Name, string Email, string ImageUrl);

public sealed record ClientCreate(string Name, IReadOnlyList<string> Tags, string InvitationCode);

public sealed record ClientUpdate(string Name, IReadOnlyList<string> Tags);

public sealed record ClientOut(
    string Name,
    IReadOnlyList<string> Tags,
    string ImageUrl,
    string Status,
    string InvitationCode,
    string TrainerUserId);

public sealed record RoutineSet(string Type, int? Reps, double? Weight, string? Note);

public sealed record RoutineExcercise(string Name, bool IsBodyweight, IReadOnlyList<RoutineSet> Sets);

public sealed record RoutineCreate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises);

public sealed record RoutineUpdate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises);

public sealed record RoutineOut(string Name, string? Note, string Id, string? UserId, IReadOnlyList<RoutineExcercise> Excercises);

public sealed record PlanWorkoutInput(
    string Name,
    string? Note,
    string Id,
    [property: JsonPropertyName("user_id")] string? UserId,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date);

public sealed record PlanWorkoutOutput(
    string Name,
    string? Note,
    string Id,
    string? UserId,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date);

public sealed record PlanCreate(string Name, string ClientId, string? Note, string Status, IReadOnlyList<PlanWorkoutInput> Workouts);

public sealed record PlanUpdate(string Name, string ClientId, string? Note, string Status, IReadOnlyList<PlanWorkoutInput> Workouts);

public sealed record PlanOut(
    string Name,
    string ClientId,
    string? Note,
    string Status,
    string Id,
    IReadOnlyList<PlanWorkoutOutput> Workouts,
    ClientOut? Client);

public sealed record PlanStatusUpdate(string Status);

public sealed record MeetingCreate(string ClientId, string StartsAt, double Price);

public sealed record MeetingUpdate(string ClientId, string StartsAt, double Price);

public sealed record MeetingOut(string ClientId, string StartsAt, double Price, string Id, string? UserId);

public sealed record CoursePrice(double Value, string Currency);

public sealed record CourseCreate(string Name, string Type, int? Size, CoursePrice Price, string? Description);

public sealed record CourseUpdate(string Name, string Type, int? Size, CoursePrice Price, string? Description);

public sealed record CourseOut(string Id, string? UserId, string Name, string Type, int? Size, CoursePrice Price, string? Description);

public sealed record ExcerciseOut(
    int Id,
    string Name,
    string ShortDescription,
    string PrimaryMuscle,
    IReadOnlyList<string> SecondaryMuscles,
    IReadOnlyList<Muscle> Muscles,
    IReadOnlyList<string> Tags);

public sealed record ExcerciseWriteRequest(
    string Name,
    string? ShortDescription,
    string PrimaryMuscle,
    IReadOnlyList<string>? SecondaryMuscles,
    IReadOnlyList<string>? Tags);

public sealed record CompletedRoutineSet(string Type, int? Reps, double? Weight, string? Note, bool Completed);

public sealed record CompletedRoutineExcercise(string Name, bool IsBodyweight, IReadOnlyList<CompletedRoutineSet> Sets);

public sealed record CompletedSourceWorkout(string Id, string Name, string Date);

public sealed record CompleteRoutineCreate(
    string Mode,
    string StartedAt,
    string CompletedAt,
    int DurationSeconds,
    int TotalSets,
    int CompletedSets,
    [property: JsonPropertyName("excercises")] IReadOnlyList<CompletedRoutineExcercise>? Excercises,
    [property: JsonPropertyName("exercises")] IReadOnlyList<CompletedRoutineExcercise>? Exercises,
    CompletedSourceWorkout SourceWorkout);

public sealed record WorkoutHistoryOut(
    string Id,
    string CurrentUserId,
    string Mode,
    string StartedAt,
    string CompletedAt,
    int DurationSeconds,
    int TotalSets,
    int CompletedSets,
    IReadOnlyList<CompletedRoutineExcercise> Excercises,
    CompletedSourceWorkout SourceWorkout);