using ExerciseGenerator.Application;
using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Infrastructure.Http;
using ExerciseGenerator.Infrastructure.Sources;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ExerciseGenerator.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddExerciseGeneratorInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Retry handler
        services.AddTransient<RetryHandler>();

        // Named HTTP clients with retry
        services.AddHttpClient("WgerApi", client =>
        {
            client.BaseAddress = new Uri("https://wger.de");
            client.DefaultRequestHeaders.UserAgent.ParseAdd("ExerciseGenerator/1.0 (+https://github.com/exercise-generator)");
            client.Timeout = TimeSpan.FromSeconds(30);
        }).AddHttpMessageHandler<RetryHandler>();

        services.AddHttpClient("General", client =>
        {
            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (compatible; ExerciseGenerator/1.0; +https://github.com/exercise-generator)");
            client.Timeout = TimeSpan.FromSeconds(20);
        }).AddHttpMessageHandler<RetryHandler>();

        // Exercise sources (order matters — higher quality first)
        services.AddTransient<IExerciseSource, BuiltInExerciseSource>();
        services.AddTransient<IExerciseSource, WgerApiSource>();
        services.AddTransient<IExerciseSource, ExerciseDbApiSource>();
        services.AddTransient<IExerciseSource, CrossFitSource>();
        services.AddTransient<IExerciseSource, MuscleWikiSource>();
        services.AddTransient<IExerciseSource, ExRxSource>();

        // Application services
        services.AddExerciseGeneratorApplication();

        return services;
    }
}
