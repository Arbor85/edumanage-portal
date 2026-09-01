using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class CourseCreateValidator : AbstractValidator<CourseCreate>
{
    public CourseCreateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Type).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Size).GreaterThan(0).When(request => request.Size.HasValue);
        RuleFor(request => request.DurationMinutes).GreaterThan(0);
        RuleFor(request => request.Description).MaximumLength(2000).When(request => request.Description is not null);
    }
}

public sealed class CourseUpdateValidator : AbstractValidator<CourseUpdate>
{
    public CourseUpdateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Type).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Size).GreaterThan(0).When(request => request.Size.HasValue);
        RuleFor(request => request.DurationMinutes).GreaterThan(0);
        RuleFor(request => request.Description).MaximumLength(2000).When(request => request.Description is not null);
    }
}

public sealed class CourseAvailabilityCreateValidator : AbstractValidator<CourseAvailabilityCreate>
{
    public CourseAvailabilityCreateValidator()
    {
        RuleFor(r => r.StartTime).NotEmpty().Matches(@"^\d{2}:\d{2}$");
        RuleFor(r => r.EndTime).NotEmpty().Matches(@"^\d{2}:\d{2}$");
    }
}

public sealed class CourseAvailabilityUpdateValidator : AbstractValidator<CourseAvailabilityUpdate>
{
    public CourseAvailabilityUpdateValidator()
    {
        RuleFor(r => r.StartTime).NotEmpty().Matches(@"^\d{2}:\d{2}$");
        RuleFor(r => r.EndTime).NotEmpty().Matches(@"^\d{2}:\d{2}$");
    }
}
