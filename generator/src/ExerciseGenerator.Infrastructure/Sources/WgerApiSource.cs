using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Fetches exercises from the free wger REST API (https://wger.de/api/v2/).
/// No API key required. Paginates through all English-language exercises.
/// </summary>
public class WgerApiSource(IHttpClientFactory httpClientFactory, ILogger<WgerApiSource> logger)
    : IExerciseSource
{
    private const string BaseUrl = "https://wger.de/api/v2";
    private const int EnglishLanguageId = 2;
    private const int RequestDelayMs = 150;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public string SourceName => "Wger API";

    public async Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("WgerApi");
        var exercises = new List<Exercise>();
        string? nextUrl = $"{BaseUrl}/exerciseinfo/?format=json&limit=100";

        while (nextUrl is not null)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var json = await client.GetStringAsync(nextUrl, cancellationToken);
            var page = JsonSerializer.Deserialize<WgerPagedResponse<WgerExerciseInfo>>(json, JsonOptions);

            if (page?.Results is null) break;

            foreach (var info in page.Results)
            {
                var translation = info.Translations
                    .FirstOrDefault(t => t.Language?.Id == EnglishLanguageId);

                if (translation is null || string.IsNullOrWhiteSpace(translation.Name))
                    continue;

                exercises.Add(MapToExercise(info, translation));
            }

            nextUrl = page.Next;
            logger.LogDebug("Fetched page, total so far: {Count}", exercises.Count);

            if (nextUrl is not null)
                await Task.Delay(RequestDelayMs, cancellationToken);
        }

        return exercises;
    }

    private static Exercise MapToExercise(WgerExerciseInfo info, WgerTranslation translation)
    {
        var primaryMuscle = info.Muscles.FirstOrDefault()?.NameEn ?? string.Empty;
        var secondaryMuscles = info.MusclesSecondary
            .Select(m => m.NameEn)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToList();

        var muscles = info.Muscles
            .Select(m => new Muscle { Name = m.NameEn })
            .Concat(info.MusclesSecondary.Select(m => new Muscle { Name = m.NameEn }))
            .Where(m => !string.IsNullOrWhiteSpace(m.Name))
            .ToList();

        var tags = BuildTagsFromEquipment(info.Equipment, info.Category?.Name ?? string.Empty);

        return new Exercise
        {
            Name = translation.Name.Trim(),
            ShortDescription = translation.Description ?? string.Empty,
            PrimaryMuscle = primaryMuscle,
            SecondaryMuscles = secondaryMuscles,
            Muscles = muscles,
            Tags = tags,
        };
    }

    private static List<string> BuildTagsFromEquipment(
        List<WgerEquipment> equipment, string categoryName)
    {
        var tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var eq in equipment)
        {
            var eqName = eq.Name?.ToLowerInvariant() ?? string.Empty;
            if (eqName.Contains("barbell")) tags.Add("barbell");
            else if (eqName.Contains("dumbbell")) tags.Add("dumbbell");
            else if (eqName.Contains("kettlebell")) tags.Add("kettlebell");
            else if (eqName.Contains("body weight") || eqName.Contains("bodyweight")) tags.Add("bodyweight");
            else if (eqName.Contains("cable") || eqName.Contains("machine")) tags.Add("machine");
            else if (eqName.Contains("resistance band")) tags.Add("bodyweight");
        }

        return [.. tags];
    }
}

// ─── Wger API DTOs ────────────────────────────────────────────────────────────

internal class WgerPagedResponse<T>
{
    [JsonPropertyName("count")]  public int Count { get; set; }
    [JsonPropertyName("next")]   public string? Next { get; set; }
    [JsonPropertyName("results")] public List<T> Results { get; set; } = [];
}

internal class WgerExerciseInfo
{
    [JsonPropertyName("id")]                public int Id { get; set; }
    [JsonPropertyName("category")]          public WgerCategory? Category { get; set; }
    [JsonPropertyName("muscles")]           public List<WgerMuscle> Muscles { get; set; } = [];
    [JsonPropertyName("muscles_secondary")] public List<WgerMuscle> MusclesSecondary { get; set; } = [];
    [JsonPropertyName("equipment")]         public List<WgerEquipment> Equipment { get; set; } = [];
    [JsonPropertyName("translations")]      public List<WgerTranslation> Translations { get; set; } = [];
}

internal class WgerCategory
{
    [JsonPropertyName("id")]   public int Id { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
}

internal class WgerMuscle
{
    [JsonPropertyName("id")]      public int Id { get; set; }
    [JsonPropertyName("name_en")] public string NameEn { get; set; } = string.Empty;
    [JsonPropertyName("is_front")] public bool IsFront { get; set; }
}

internal class WgerEquipment
{
    [JsonPropertyName("id")]   public int Id { get; set; }
    [JsonPropertyName("name")] public string? Name { get; set; }
}

internal class WgerTranslation
{
    [JsonPropertyName("id")]          public int Id { get; set; }
    [JsonPropertyName("language")]    public WgerLanguage? Language { get; set; }
    [JsonPropertyName("name")]        public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string? Description { get; set; }
}

internal class WgerLanguage
{
    [JsonPropertyName("id")]         public int Id { get; set; }
    [JsonPropertyName("short_name")] public string ShortName { get; set; } = string.Empty;
}
