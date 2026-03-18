using EduManage.Application.Contracts;
using EduManage.Infrastructure.Persistence;
using EduManage.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<EduManageDbContext>(options =>
            options.UseInMemoryDatabase("EduManageDb"));

        // Register individual repositories
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IExerciseRepository, ExerciseRepository>();
        services.AddScoped<IRoutineRepository, RoutineRepository>();
        services.AddScoped<IWorkoutHistoryRepository, WorkoutHistoryRepository>();


        return services;
    }
}