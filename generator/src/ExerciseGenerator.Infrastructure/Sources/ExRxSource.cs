using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;

namespace ExerciseGenerator.Infrastructure.Sources;

/// <summary>
/// Attempts to scrape exercise names from ExRx.net exercise directory.
/// Falls back gracefully if the site is unavailable or blocks scraping.
/// </summary>
public class ExRxSource(IHttpClientFactory httpClientFactory, ILogger<ExRxSource> logger)
    : IExerciseSource
{
    private const string DirectoryUrl = "https://exrx.net/Lists/Directory";

    public string SourceName => "ExRx";

    public async Task<IEnumerable<Exercise>> FetchExercisesAsync(CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("General");
        var exercises = new List<Exercise>();

        try
        {
            var html = await client.GetStringAsync(DirectoryUrl, cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // ExRx lists exercises in <li> elements inside exercise category sections
            var listItems = doc.DocumentNode.SelectNodes(
                "//article//li/a | //section//li/a | //div[contains(@class,'col')]//li/a")
                ?? new HtmlAgilityPack.HtmlNodeCollection(null);

            foreach (var node in listItems)
            {
                var name = HtmlEntity.DeEntitize(node.InnerText).Trim();
                if (string.IsNullOrWhiteSpace(name) || name.Length < 3 || name.Length > 120)
                    continue;

                // Skip navigation links and non-exercise entries
                if (name.Contains("↑") || name.Contains("Top") || name.StartsWith("See "))
                    continue;

                exercises.Add(new Exercise { Name = name });
            }

            // If that fails, try a simpler selector for all meaningful links
            if (exercises.Count == 0)
            {
                var allLinks = doc.DocumentNode.SelectNodes("//a[@href]") ?? new HtmlAgilityPack.HtmlNodeCollection(null);
                foreach (var link in allLinks)
                {
                    var href = link.GetAttributeValue("href", string.Empty);
                    if (!href.Contains("/WeightExercises/") && !href.Contains("/Aerobic/") &&
                        !href.Contains("/Plyometrics/") && !href.Contains("/Flexibility/"))
                        continue;

                    var name = HtmlEntity.DeEntitize(link.InnerText).Trim();
                    if (string.IsNullOrWhiteSpace(name) || name.Length < 3 || name.Length > 120)
                        continue;

                    exercises.Add(new Exercise { Name = name });
                }
            }

            logger.LogInformation("ExRx source scraped {Count} exercises", exercises.Count);
        }
        catch (Exception ex)
        {
            logger.LogWarning("ExRx source unavailable: {Message}", ex.Message);
        }

        return exercises;
    }
}
