using EduManage.Application.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IEduManageRepository, InMemoryEduManageRepository>();
        return services;
    }
}