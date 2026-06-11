using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Attempts to scrape exercise names from the CrossFit exercise library.
/// Gracefully returns empty on failure (JavaScript-rendered pages may not be scrapable).
/// </summary>
public class CrossFitSource(IHttpClientFactory httpClientFactory, ILogger<CrossFitSource> logger)
    : IExerciseSource
{
    public string SourceName => "CrossFit Library";

    public async Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("General");
        var exercises = new List<Exercise>();

        try
        {
            var html = await client.GetStringAsync("https://www.crossfit.com/exercises", cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Try to find exercise links / names from the page
            var links = doc.DocumentNode
                .SelectNodes("//a[contains(@href, '/exercise/') or contains(@href, '/exercises/')]")
                ?? new HtmlAgilityPack.HtmlNodeCollection(null);

            foreach (var link in links)
            {
                var name = HtmlEntity.DeEntitize(link.InnerText).Trim();
                if (string.IsNullOrWhiteSpace(name) || name.Length < 3 || name.Length > 100)
                    continue;

                exercises.Add(new Exercise
                {
                    Name = name,
                    Tags = ["crossfit"],
                });
            }

            // Also look for headings that contain exercise names
            if (exercises.Count == 0)
            {
                var headings = doc.DocumentNode
                    .SelectNodes("//h2 | //h3 | //h4 | //*[contains(@class,'exercise-title') or contains(@class,'exercise-name')]")
                    ?? new HtmlAgilityPack.HtmlNodeCollection(null);

                foreach (var heading in headings)
                {
                    var name = HtmlEntity.DeEntitize(heading.InnerText).Trim();
                    if (string.IsNullOrWhiteSpace(name) || name.Length < 3 || name.Length > 100)
                        continue;

                    exercises.Add(new Exercise
                    {
                        Name = name,
                        Tags = ["crossfit"],
                    });
                }
            }

            logger.LogInformation("CrossFit source scraped {Count} exercises", exercises.Count);
        }
        catch (Exception ex)
        {
            logger.LogWarning("CrossFit source unavailable: {Message}", ex.Message);
        }

        return exercises;
    }
}
