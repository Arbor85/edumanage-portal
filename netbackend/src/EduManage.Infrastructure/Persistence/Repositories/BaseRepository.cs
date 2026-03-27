using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal abstract class BaseRepository<TEntity, TKey>(EduManageDbContext context)
    : IRepository<TEntity, TKey> where TEntity : class
{
    protected readonly EduManageDbContext Context = context;

    protected virtual IQueryable<TEntity> GetQuery() => Context.Set<TEntity>();

    public async Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken cancellationToken) =>
        await GetQuery().ToListAsync(cancellationToken);

    public virtual async Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken) =>
        await Context.Set<TEntity>().FindAsync([id], cancellationToken);

    public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken)
    {
        Context.Set<TEntity>().Add(entity);
        await Context.SaveChangesAsync(cancellationToken);

        return entity;
    }

    public virtual async Task UpdateAsync(TEntity entity, CancellationToken cancellationToken) =>
        await Context.SaveChangesAsync(cancellationToken);

    public async Task DeleteByIdAsync(TKey id, CancellationToken cancellationToken)
    {
        var entity = await Context.Set<TEntity>().FindAsync([id], cancellationToken);
        if (entity is null)
            throw new NotFoundException($"{typeof(TEntity).Name} '{id}' was not found.");

        Context.Set<TEntity>().Remove(entity);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public IAsyncEnumerable<TEntity> Enumerate => GetQuery().AsAsyncEnumerable();
}
