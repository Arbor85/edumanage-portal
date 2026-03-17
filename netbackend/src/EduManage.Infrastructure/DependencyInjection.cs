using EduManage.Application.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<EduManageDbContext>(options => options.UseInMemoryDatabase("EduManage"));

        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IExcerciseRepository, ExcerciseRepository>();
        services.AddScoped<IRoutineRepository, RoutineRepository>();
        return services;
    }
}