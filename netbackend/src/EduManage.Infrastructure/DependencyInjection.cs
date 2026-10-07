using EduManage.Application.Contracts;
using EduManage.Infrastructure.Persistence;
using EduManage.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduManage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string databaseConnectionString)
    {
        var connectionString = databaseConnectionString;

        services.AddDbContext<EduManageDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        // Register individual repositories
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IExerciseRepository, ExerciseRepository>();
        services.AddScoped<IDefaultWorkoutRepository, DefaultWorkoutRepository>();
        services.AddScoped<IRoutineRepository, RoutineRepository>();
        services.AddScoped<IWorkoutHistoryRepository, WorkoutHistoryRepository>();
        services.AddScoped<IEquipmentRepository, EquipmentRepository>();
        services.AddScoped<IUserEquipmentRepository, UserEquipmentRepository>();
        services.AddScoped<IUserExercisePreferenceRepository, UserExercisePreferenceRepository>();
        services.AddScoped<IUserExerciseMaxRepository, UserExerciseMaxRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IOrganizationMembershipRepository, OrganizationMembershipRepository>();
        services.AddScoped<ITrainerAvailabilityRepository, TrainerAvailabilityRepository>();
        services.AddScoped<IBuildingRepository, BuildingRepository>();
        services.AddScoped<IBuildingAvailabilityRepository, BuildingAvailabilityRepository>();
        services.AddScoped<ICourseAvailabilityRepository, CourseAvailabilityRepository>();
        services.AddScoped<ITrainerCourseAssociationRepository, TrainerCourseAssociationRepository>();
        services.AddScoped<ISchedulePlanRepository, SchedulePlanRepository>();
        services.AddScoped<IScheduleEntryRepository, ScheduleEntryRepository>();
        services.AddScoped<IApiKeyRepository, ApiKeyRepository>();
        services.AddScoped<IFormTemplateRepository, FormTemplateRepository>();
        services.AddScoped<IFormTemplateVersionRepository, FormTemplateVersionRepository>();
        services.AddScoped<IFormResponseRepository, FormResponseRepository>();
        services.AddScoped<IStandaloneFormResponseRepository, StandaloneFormResponseRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IUserChallengeLogRepository, UserChallengeLogRepository>();
        services.AddScoped<IBodyMeasurementRepository, BodyMeasurementRepository>();

        return services;
    }
}