namespace EduManage.Domain.Entities;

public class UserExercisePreference
{
    public string UserId { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public bool IsDirectFavourite { get; set; }
    public int UsageCount { get; set; }
}
