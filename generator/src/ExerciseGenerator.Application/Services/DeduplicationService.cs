using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Domain.Models;

namespace ExerciseGenerator.Application.Services;

public class DeduplicationService : IDeduplicationService
{
    private const double SimilarityThreshold = 0.90;

    public IReadOnlyList<Exercise> Deduplicate(IEnumerable<Exercise> exercises, out int duplicatesRemoved)
    {
        var exerciseList = exercises.ToList();
        var duplicatesToRemoved = 0;

        // First pass: exact normalized-name dedup — keep the record with most data
        var firstPass = exerciseList
            .GroupBy(e => NormalizeName(e.Name))
            .Select(g =>
            {
                var items = g.ToList();
                duplicatesToRemoved += items.Count - 1;
                return items.OrderByDescending(e => e.DataCompleteness).First();
            })
            .ToList();
        duplicatesRemoved = duplicatesToRemoved;

        // Second pass: fuzzy dedup with Levenshtein + Jaccard
        var result = new List<Exercise>();
        var skipped = new HashSet<int>();

        for (int i = 0; i < firstPass.Count; i++)
        {
            if (skipped.Contains(i)) continue;

            var best = firstPass[i];

            for (int j = i + 1; j < firstPass.Count; j++)
            {
                if (skipped.Contains(j)) continue;

                double sim = CombinedSimilarity(firstPass[i].Name, firstPass[j].Name);
                if (sim >= SimilarityThreshold)
                {
                    if (firstPass[j].DataCompleteness > best.DataCompleteness)
                        best = firstPass[j];

                    skipped.Add(j);
                    duplicatesRemoved++;
                }
            }

            result.Add(best);
        }

        return result.AsReadOnly();
    }

    private static string NormalizeName(string name) =>
        name.ToLowerInvariant()
            .Replace("-", " ")
            .Replace("_", " ")
            .Replace("  ", " ")
            .Trim();

    public static double CombinedSimilarity(string s1, string s2)
    {
        s1 = s1.ToLowerInvariant().Trim();
        s2 = s2.ToLowerInvariant().Trim();

        if (s1 == s2) return 1.0;

        double lev = LevenshteinSimilarity(s1, s2);
        double jaccard = JaccardSimilarity(s1, s2);
        return 0.6 * lev + 0.4 * jaccard;
    }

    private static double LevenshteinSimilarity(string s1, string s2)
    {
        int distance = LevenshteinDistance(s1, s2);
        int maxLen = Math.Max(s1.Length, s2.Length);
        return maxLen == 0 ? 1.0 : 1.0 - (double)distance / maxLen;
    }

    private static double JaccardSimilarity(string s1, string s2)
    {
        var tokens1 = new HashSet<string>(
            s1.Split([' ', '-', '_'], StringSplitOptions.RemoveEmptyEntries));
        var tokens2 = new HashSet<string>(
            s2.Split([' ', '-', '_'], StringSplitOptions.RemoveEmptyEntries));

        if (tokens1.Count == 0 && tokens2.Count == 0) return 1.0;

        int intersection = tokens1.Intersect(tokens2).Count();
        int union = tokens1.Union(tokens2).Count();
        return union == 0 ? 0 : (double)intersection / union;
    }

    private static int LevenshteinDistance(string s, string t)
    {
        int n = s.Length, m = t.Length;
        if (n == 0) return m;
        if (m == 0) return n;

        int[] prev = Enumerable.Range(0, m + 1).ToArray();
        int[] curr = new int[m + 1];

        for (int i = 1; i <= n; i++)
        {
            curr[0] = i;
            for (int j = 1; j <= m; j++)
            {
                int cost = s[i - 1] == t[j - 1] ? 0 : 1;
                curr[j] = Math.Min(
                    Math.Min(prev[j] + 1, curr[j - 1] + 1),
                    prev[j - 1] + cost);
            }
            Array.Copy(curr, prev, m + 1);
        }

        return prev[m];
    }
}
