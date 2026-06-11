using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Fetches exercises from the ExerciseDB API on RapidAPI.
/// Requires an API key in configuration: ExerciseDb:ApiKey
/// Source is silently skipped when no key is configured.
/// </summary>
public class ExerciseDbApiSource(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<ExerciseDbApiSource> logger) : IExerciseSource
{
    private const string ApiHost = "exercisedb.p.rapidapi.com";
    private const string BaseUrl = "https://exercisedb.p.rapidapi.com";

    public string SourceName => "ExerciseDB API";

    public async Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["ExerciseDb:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogInformation("ExerciseDB API key not configured — skipping source");
            return [];
        }

        var client = httpClientFactory.CreateClient("General");
        client.DefaultRequestHeaders.TryAddWithoutValidation("X-RapidAPI-Key", apiKey);
        client.DefaultRequestHeaders.TryAddWithoutValidation("X-RapidAPI-Host", ApiHost);

        var exercises = new List<Exercise>();
        int offset = 0;
        const int limit = 100;

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var url = $"{BaseUrl}/exercises?limit={limit}&offset={offset}";
            var json = await client.GetStringAsync(url, cancellationToken);
            var items = JsonSerializer.Deserialize<List<ExerciseDbItem>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (items is null || items.Count == 0) break;

            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.Name)) continue;
                exercises.Add(MapToExercise(item));
            }

            if (items.Count < limit) break;
            offset += limit;
            await Task.Delay(200, cancellationToken);
        }

        return exercises;
    }

    private static Exercise MapToExercise(ExerciseDbItem item)
    {
        var primaryMuscle = CapitalizeFirst(item.Target ?? string.Empty);
        var secondary = (item.SecondaryMuscles ?? [])
            .Select(CapitalizeFirst)
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .ToList();

        var muscles = new List<Muscle>();
        if (!string.IsNullOrWhiteSpace(primaryMuscle))
            muscles.Add(new Muscle { Name = primaryMuscle });
        muscles.AddRange(secondary.Select(m => new Muscle { Name = m }));

        var tags = new List<string>();
        var eq = item.Equipment?.ToLowerInvariant() ?? string.Empty;
        if (eq.Contains("barbell")) tags.Add("barbell");
        else if (eq.Contains("dumbbell")) tags.Add("dumbbell");
        else if (eq.Contains("kettlebell")) tags.Add("kettlebell");
        else if (eq.Contains("body weight")) tags.Add("bodyweight");
        else if (eq.Contains("cable") || eq.Contains("machine")) tags.Add("machine");

        return new Exercise
        {
            Name = CapitalizeWords(item.Name ?? string.Empty),
            PrimaryMuscle = primaryMuscle,
            SecondaryMuscles = secondary,
            Muscles = muscles,
            Tags = tags,
        };
    }

    private static string CapitalizeFirst(string s) =>
        string.IsNullOrWhiteSpace(s) ? s
            : char.ToUpperInvariant(s[0]) + s[1..].ToLowerInvariant();

    private static string CapitalizeWords(string s) =>
        string.Join(" ", s.Split(' ').Select(CapitalizeFirst));
}

internal class ExerciseDbItem
{
    [JsonPropertyName("id")]               public string? Id { get; set; }
    [JsonPropertyName("name")]             public string? Name { get; set; }
    [JsonPropertyName("bodyPart")]         public string? BodyPart { get; set; }
    [JsonPropertyName("equipment")]        public string? Equipment { get; set; }
    [JsonPropertyName("target")]           public string? Target { get; set; }
    [JsonPropertyName("secondaryMuscles")] public List<string>? SecondaryMuscles { get; set; }
    [JsonPropertyName("instructions")]     public List<string>? Instructions { get; set; }
}
