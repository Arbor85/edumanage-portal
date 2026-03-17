using System.Text.Json.Nodes;

namespace EduManage.Domain.Entities;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string PrimaryMuscle { get; set; } = string.Empty;
    
    // Property stored as JSON string in database, automatically converted by EF value converter
    public IReadOnlyList<JsonObject> Muscles { get; set; } = [];
    
    public List<string> Tags { get; set; } = [];
}
