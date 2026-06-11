using ExerciseGenerator.Application.Interfaces;
using ExerciseGenerator.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ExerciseGenerator.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddExerciseGeneratorApplication(this IServiceCollection services)
    {
        services.AddTransient<IDeduplicationService, DeduplicationService>();
        services.AddTransient<ITagClassificationService, TagClassificationService>();
        services.AddTransient<IMuscleClassificationService, MuscleClassificationService>();
        services.AddTransient<IDescriptionGeneratorService, DescriptionGeneratorService>();
        services.AddTransient<IActivityClassificationService, ActivityClassificationService>();
        services.AddTransient<IValidationService, ValidationService>();
        services.AddTransient<IExerciseAggregatorService, ExerciseAggregatorService>();
        return services;
    }
}
