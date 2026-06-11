namespace ExerciseGenerator.Domain.Models;

public class Report
{
    public DateTime GeneratedAt { get; set; }
    public double ExecutionTimeSeconds { get; set; }
    public Dictionary<string, int> RecordsPerSource { get; set; } = [];
    public int TotalFetchedRecords { get; set; }
    public int DuplicatesRemoved { get; set; }
    public int ValidationErrorsRemoved { get; set; }
    public int FinalRecordCount { get; set; }
    public List<string> ValidationErrors { get; set; } = [];
    public List<string> SourceErrors { get; set; } = [];
}
