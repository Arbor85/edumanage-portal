namespace EduManage.Domain.Entities;

public class UserExerciseMax
{
    public string UserId { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;
    public float? MaxWeight { get; set; }
    public int? MaxReps { get; set; }
    public float? MaxDuration { get; set; }
    public float? MaxDistance { get; set; }
    public string? Note { get; set; }
    public DateTime UpdatedAt { get; set; }
}
