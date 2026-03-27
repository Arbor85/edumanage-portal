namespace EduManage.Application.Contracts;

public interface IRepository<TEntity, TKey> where TEntity : class
{
    Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken cancellationToken);
    IAsyncEnumerable<TEntity> Enumerate { get; }
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken);
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken);
    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken);
    Task DeleteByIdAsync(TKey id, CancellationToken cancellationToken);
}
