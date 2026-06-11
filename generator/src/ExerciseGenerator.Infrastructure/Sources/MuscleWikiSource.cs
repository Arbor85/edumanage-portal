using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Attempts to fetch exercise data from MuscleWiki.
/// Tries their public API endpoints; falls back gracefully on failure.
/// </summary>
public class MuscleWikiSource(IHttpClientFactory httpClientFactory, ILogger<MuscleWikiSource> logger)
    : IExerciseSource
{
    public string SourceName => "MuscleWiki";

    public async Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
    {
        var exercises = new List<Exercise>();

        try
        {
            exercises.AddRange(await FetchFromApiAsync(cancellationToken));
        }
        catch (Exception ex)
        {
            logger.LogWarning("MuscleWiki API unavailable: {Message}", ex.Message);
        }

        if (exercises.Count == 0)
        {
            try
            {
                exercises.AddRange(await ScrapeFromPageAsync(cancellationToken));
            }
            catch (Exception ex)
            {
                logger.LogWarning("MuscleWiki scraping unavailable: {Message}", ex.Message);
            }
        }

        logger.LogInformation("MuscleWiki source returned {Count} exercises", exercises.Count);
        return exercises;
    }

    private async Task<IEnumerable<Exercise>> FetchFromApiAsync(CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("General");
        var exercises = new List<Exercise>();

        // MuscleWiki has a public REST API used by their SPA
        var muscles = new[] { "chest", "back", "shoulders", "biceps", "triceps",
                               "forearms", "quadriceps", "hamstrings", "glutes", "calves", "abs" };

        foreach (var muscle in muscles)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var url = $"https://musclewiki.com/api/exercises/?muscle={muscle}&limit=50";
            var json = await client.GetStringAsync(url, cancellationToken);

            var response = JsonSerializer.Deserialize<MuscleWikiResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (response?.Results is null) continue;

            foreach (var item in response.Results)
            {
                if (string.IsNullOrWhiteSpace(item.Name)) continue;

                exercises.Add(new Exercise
                {
                    Name = item.Name.Trim(),
                    PrimaryMuscle = item.PrimaryMuscle ?? string.Empty,
                    SecondaryMuscles = item.SecondaryMuscles ?? [],
                    Muscles = BuildMuscleList(item.PrimaryMuscle, item.SecondaryMuscles),
                });
            }

            await Task.Delay(100, cancellationToken);
        }

        return exercises;
    }

    private async Task<IEnumerable<Exercise>> ScrapeFromPageAsync(CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("General");
        var exercises = new List<Exercise>();

        var html = await client.GetStringAsync("https://musclewiki.com/exercises/", cancellationToken);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var nodes = doc.DocumentNode
            .SelectNodes("//*[contains(@class,'exercise') or contains(@class,'Exercise')]//h2 | //*[contains(@class,'exercise') or contains(@class,'Exercise')]//h3")
            ?? new HtmlAgilityPack.HtmlNodeCollection(null);

        foreach (var node in nodes)
        {
            var name = HtmlEntity.DeEntitize(node.InnerText).Trim();
            if (!string.IsNullOrWhiteSpace(name) && name.Length >= 3 && name.Length <= 100)
            {
                exercises.Add(new Exercise { Name = name });
            }
        }

        return exercises;
    }

    private static List<Muscle> BuildMuscleList(string? primary, List<string>? secondary)
    {
        var list = new List<Muscle>();
        if (!string.IsNullOrWhiteSpace(primary))
            list.Add(new Muscle { Name = primary });
        if (secondary is not null)
            list.AddRange(secondary.Select(m => new Muscle { Name = m }));
        return list;
    }
}

internal class MuscleWikiResponse
{
    [JsonPropertyName("results")] public List<MuscleWikiExercise>? Results { get; set; }
}

internal class MuscleWikiExercise
{
    [JsonPropertyName("name")]             public string? Name { get; set; }
    [JsonPropertyName("primary_muscle")]   public string? PrimaryMuscle { get; set; }
    [JsonPropertyName("secondary_muscles")] public List<string>? SecondaryMuscles { get; set; }
    [JsonPropertyName("category")]         public string? Category { get; set; }
}
