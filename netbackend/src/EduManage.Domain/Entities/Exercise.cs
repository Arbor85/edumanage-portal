namespace EduManage.Domain.Entities;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string PrimaryMuscle { get; set; } = string.Empty;

    public IReadOnlyList<Muscle> Muscles { get; set; } = [];

    public List<string> Tags { get; set; } = [];
}
