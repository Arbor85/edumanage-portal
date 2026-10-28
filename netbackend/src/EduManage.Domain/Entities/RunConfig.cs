namespace EduManage.Domain.Entities;

public record RunConfig
{
    public RunType RunType { get; init; }
    public ActivityTrackType TrackType { get; init; }

    // Intervals only
    public int? Repeats { get; init; }
    public int? IntervalDistanceMeters { get; init; }
    public int? IntervalDurationSeconds { get; init; }
    public int? RestSeconds { get; init; }

    // All types
    public int? TotalDistanceMeters { get; init; }
    public int? TotalDurationSeconds { get; init; }
    public double? TargetPaceMinPerKm { get; init; }
    public EffortLevel? EffortLevel { get; init; }

    // Tempo optional
    public int? WarmupSeconds { get; init; }
    public int? CooldownSeconds { get; init; }
}
