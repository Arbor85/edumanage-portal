using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure;

internal abstract class RepositoryBase(EduManageDbContext dbContext)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    protected static string NewId() => Guid.NewGuid().ToString("N");

    protected async Task<IReadOnlyList<TModel>> ListAsync<TModel>(string category, CancellationToken cancellationToken)
    {
        var documents = await dbContext.Documents
            .AsNoTracking()
            .Where(document => document.Category == category)
            .ToListAsync(cancellationToken);

        return documents.Select(ToModel<TModel>).ToList();
    }

    protected async Task<TModel?> FindAsync<TModel>(string category, string documentId, CancellationToken cancellationToken)
    {
        var storageKey = BuildStorageKey(category, documentId);
        var document = await dbContext.Documents
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.StorageKey == storageKey, cancellationToken);

        return document is null ? default : ToModel<TModel>(document);
    }

    protected async Task SaveAsync<TModel>(string category, string documentId, TModel model, CancellationToken cancellationToken)
    {
        var storageKey = BuildStorageKey(category, documentId);
        var existing = await dbContext.Documents
            .SingleOrDefaultAsync(candidate => candidate.StorageKey == storageKey, cancellationToken);

        if (existing is null)
        {
            dbContext.Documents.Add(new StoredDocument
            {
                StorageKey = storageKey,
                Category = category,
                DocumentId = documentId,
                Payload = JsonSerializer.Serialize(model, JsonOptions)
            });
        }
        else
        {
            existing.Payload = JsonSerializer.Serialize(model, JsonOptions);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    protected async Task<bool> DeleteAsync(string category, string documentId, CancellationToken cancellationToken)
    {
        var storageKey = BuildStorageKey(category, documentId);
        var existing = await dbContext.Documents
            .SingleOrDefaultAsync(candidate => candidate.StorageKey == storageKey, cancellationToken);

        if (existing is null)
        {
            return false;
        }

        dbContext.Documents.Remove(existing);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static TModel ToModel<TModel>(StoredDocument document)
    {
        return JsonSerializer.Deserialize<TModel>(document.Payload, JsonOptions)
            ?? throw new InvalidOperationException($"Unable to deserialize document '{document.StorageKey}'.");
    }

    private static string BuildStorageKey(string category, string documentId) => $"{category}:{documentId}";
}

internal static class RepositoryCategories
{
    public const string Plans = "plans";
    public const string Meetings = "meetings";
    public const string Courses = "courses";
    public const string Clients = "clients";
    public const string Excercises = "excercises";
    public const string Routines = "routines";
    public const string WorkoutHistory = "workout-history";
}
