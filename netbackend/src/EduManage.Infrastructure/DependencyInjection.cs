using EduManage.Application.Contracts;
using EduManage.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<EduManageDbContext>(options =>
            options.UseInMemoryDatabase("EduManageDb"));

        services.AddScoped<IEduManageRepository, EduManageRepository>();

        return services;
    }
}