using EduManage.Domain.Entities;
using System.Text.Json.Serialization;

namespace EduManage.Application.Contracts;

public sealed record AcceptClientInvitationRequest(string Name, string Email, string ImageUrl);

public sealed record ClientCreate(string Name, IReadOnlyList<string> Tags);

public sealed record ClientUpdate(string Name, IReadOnlyList<string> Tags);

public sealed record ClientOut(
    string Name,
    IReadOnlyList<string> Tags,
    string ImageUrl,
    string Status,
    string InvitationCode,
    string TrainerUserId,
    string? FirstName,
    string? LastName,
    string? Email,
    string? Gender);

public sealed record InvitationOut(
    string Name,
    string ImageUrl
);

public sealed record RoutineSet(string Type, int? Reps, int? Duration, int? Distance, double? Weight, string? Note);

public sealed record SupersetGroup(string Id, string? Name, string Color);

public sealed record DropConfig(int Count, double WeightDecreasePercent);

public sealed record RoutineExcercise(
    string Name,
    ActivityType ActivityType,
    ActivityTrackType ActivityTrackType,
    IReadOnlyList<RoutineSet> Sets,
    string? SupersetGroupId = null,
    DropConfig? DropConfig = null,
    int? ExerciseId = null);

public sealed record RoutineCreate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup>? SupersetGroups = null);

public sealed record RoutineUpdate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup>? SupersetGroups = null);

public sealed record RoutineOut(string Name, string? Note, string Id, string? UserId, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup> SupersetGroups);

public sealed record PlanWorkoutInput(
    string Name,
    string? Note,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup>? SupersetGroups = null,
    bool IsMeeting = false,
    string? MeetingId = null,
    double? MeetingPrice = null,
    string? MeetingStartTime = null);

public sealed record PlanWorkoutOutput(
    string Name,
    string? Note,
    string Id,
    string? UserId,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup> SupersetGroups,
    bool IsMeeting = false,
    string? MeetingId = null,
    double? MeetingPrice = null,
    string? MeetingStartTime = null);

public sealed record PlanCreate(string Name, string? ClientId, string? Note, IReadOnlyList<PlanWorkoutInput> Workouts);

public sealed record PlanUpdate(string Name, string? ClientId, string? Note, IReadOnlyList<PlanWorkoutInput> Workouts);

public sealed record PlanOut(
    string Name,
    string? ClientId,
    string? Note,
    string Status,
    string Id,
    IReadOnlyList<PlanWorkoutOutput> Workouts,
    ClientOut? Client);

public sealed record PlanStatusUpdate(string Status);

public sealed record MeetingCreate(string ClientId, string StartsAt, double Price);

public sealed record MeetingUpdate(string ClientId, string StartsAt, double Price);

public sealed record MeetingOut(string ClientId, string StartsAt, double Price, string Id, string? UserId);

public sealed record CourseCreate(string Name, string Type, int? Size, int DurationMinutes, string? Description);

public sealed record CourseUpdate(string Name, string Type, int? Size, int DurationMinutes, string? Description);

public sealed record CourseOut(string Id, string? UserId, string Name, string Type, int? Size, int? DurationMinutes, string? Description);

public sealed record CourseAvailabilityCreate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);

public sealed record CourseAvailabilityUpdate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);

public sealed record CourseAvailabilityOut(string Id, string CourseId, IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);

public sealed record ExcerciseOut(
    int Id,
    string Name,
    string ShortDescription,
    string PrimaryMuscle,
    IReadOnlyList<string> SecondaryMuscles,
    IReadOnlyList<Muscle> Muscles,
    IReadOnlyList<string> Tags,
    ActivityType ActivityType,
    ActivityTrackType ActivityTrackType,
    IReadOnlyList<string>? Instructions = null,
    string? Equipment = null,
    string? Level = null,
    string? Force = null,
    string? Mechanic = null,
    string? Category = null,
    string? ImagePath = null,
    string? GifPath = null,
    string? DatasetId = null,
    bool IsDirectFavourite = false,
    int UsageCount = 0);

public sealed record ExcerciseWriteRequest(
    string Name,
    string? ShortDescription,
    string PrimaryMuscle,
    IReadOnlyList<string>? SecondaryMuscles,
    IReadOnlyList<string>? Tags,
    ActivityType ActivityType = ActivityType.Weighted,
    ActivityTrackType ActivityTrackType = ActivityTrackType.Repetitions,
    IReadOnlyList<string>? Instructions = null,
    string? Equipment = null,
    string? Level = null,
    string? Force = null,
    string? Mechanic = null,
    string? Category = null,
    string? ImagePath = null,
    string? GifPath = null,
    string? DatasetId = null);

public sealed record CompletedRoutineSet(
    string Type,
    int? Reps,
    int? Duration,
    int? Distance,
    double? Weight,
    string? Note,
    bool Completed);

public sealed record CompletedRoutineExcercise(
    string Name,
    ActivityType ActivityType,
    ActivityTrackType ActivityTrackType,
    IReadOnlyList<CompletedRoutineSet> Sets);

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

public sealed record DefaultWorkoutOut(
    string Id,
    string Name,
    string? Note,
    IReadOnlyList<RoutineExcercise> Excercises);

public sealed record EquipmentOut(
    string Id,
    string? Name,
    EquipmentType EquipmentType,
    List<decimal>? WeightOptions,
    bool IsCore);

public sealed record EquipmentWriteRequest(
    string? Name,
    EquipmentType EquipmentType,
    List<decimal>? WeightOptions);

public sealed record UserEquipmentOut(
    string EquipmentId,
    string? Name,
    EquipmentType EquipmentType,
    List<decimal>? AvailableWeights);

public sealed record UserEquipmentBatchUpdate(
    List<UserEquipmentSave> Equipment);

public sealed record UserEquipmentSave(
    string EquipmentId,
    List<decimal>? AvailableWeights);

// Organization
public sealed record OrganizationCreate(string Name);
public sealed record OrganizationOut(string Id, string Name, string OwnerId, string InviteCode, int TrainerCount);
public sealed record OrganizationMemberOut(string TrainerUserId, string JoinedAt, string? FirstName = null, string? LastName = null);
public sealed record JoinOrganizationRequest(string? FirstName, string? LastName, IReadOnlyList<AvailabilityCreate>? InitialAvailabilities);

// TrainerAvailability
public sealed record AvailabilityCreate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);
public sealed record AvailabilityUpdate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);
public sealed record AvailabilityOut(string Id, string OrganizationId, string TrainerUserId, IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);

// Building
public sealed record BuildingCreate(string Name, string Address, int Capacity);
public sealed record BuildingUpdate(string Name, string Address, int Capacity);
public sealed record BuildingOut(string Id, string OrganizationId, string Name, string Address, int Capacity);

// BuildingAvailability
public sealed record BuildingAvailabilityCreate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);
public sealed record BuildingAvailabilityUpdate(IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);
public sealed record BuildingAvailabilityOut(string Id, string BuildingId, IReadOnlyList<string> DaysOfWeek, string StartTime, string EndTime, string? ValidFrom, string? ValidTo);

// TrainerCourseAssociation
public sealed record TrainerCourseAssociationCreate(string TrainerId, string CourseId);
public sealed record TrainerCourseAssociationOut(string Id, string OrganizationId, string TrainerUserId, string CourseId);

// SchedulePlan
public sealed record SchedulePlanCreate(string Name);
public sealed record SchedulePlanUpdate(string Name);
public sealed record SchedulePlanOut(string Id, string OrganizationId, string Name, string Status, string CreatedAt);

// ScheduleEntry
public sealed record ScheduleEntryCreate(
    string TrainerUserId,
    string BuildingId,
    string CourseId,
    string StartDate,
    string StartTime,
    string EndTime,
    string RecurrenceType,
    int? RecurrenceInterval = null,
    string? ValidUntil = null);
public sealed record ScheduleEntryUpdate(
    string TrainerUserId,
    string BuildingId,
    string CourseId,
    string StartDate,
    string StartTime,
    string EndTime,
    string RecurrenceType,
    int? RecurrenceInterval = null,
    string? ValidUntil = null);
public sealed record ScheduleEntryOut(
    string Id,
    string SchedulePlanId,
    string TrainerUserId,
    string BuildingId,
    string CourseId,
    string StartDate,
    string StartTime,
    string EndTime,
    string RecurrenceType,
    int? RecurrenceInterval,
    string? ValidUntil,
    bool HasMismatch);

// AutoSchedule
public sealed record AutoScheduleRequest(
    IReadOnlyList<string> CourseIds,
    IReadOnlyList<string> BuildingIds,
    IReadOnlyList<string> TrainerIds);
public sealed record AutoScheduleResult(
    IReadOnlyList<ScheduleEntryOut> Scheduled,
    IReadOnlyList<UnscheduledCourse> Unscheduled);
public sealed record UnscheduledCourse(string CourseId, string CourseName, string Reason);
public sealed record ConfirmAutoScheduleRequest(IReadOnlyList<ScheduleEntryCreate> Entries);