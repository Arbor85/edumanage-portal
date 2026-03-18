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
        RuleFor(request => request.Description).MaximumLength(2000).When(request => request.Description is not null);
        RuleFor(request => request.Price).SetValidator(new CoursePriceValidator());
    }
}

public sealed class CourseUpdateValidator : AbstractValidator<CourseUpdate>
{
    public CourseUpdateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Type).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Size).GreaterThan(0).When(request => request.Size.HasValue);
        RuleFor(request => request.Description).MaximumLength(2000).When(request => request.Description is not null);
        RuleFor(request => request.Price).SetValidator(new CoursePriceValidator());
    }
}

public sealed class CoursePriceValidator : AbstractValidator<CoursePrice>
{
    public CoursePriceValidator()
    {
        RuleFor(request => request.Value).GreaterThanOrEqualTo(0);
        RuleFor(request => request.Currency).NotEmpty().MaximumLength(10);
    }
}