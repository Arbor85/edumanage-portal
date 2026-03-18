using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class PlanCreateValidator : AbstractValidator<PlanCreate>
{
    public PlanCreateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.ClientId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Notes).MaximumLength(2000).When(request => request.Notes is not null);
        RuleFor(request => request.Status).NotEmpty().MaximumLength(100);
        RuleForEach(request => request.Workouts).SetValidator(new PlanWorkoutInputValidator());
    }
}

public sealed class PlanUpdateValidator : AbstractValidator<PlanUpdate>
{
    public PlanUpdateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.ClientId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Notes).MaximumLength(2000).When(request => request.Notes is not null);
        RuleFor(request => request.Status).NotEmpty().MaximumLength(100);
        RuleForEach(request => request.Workouts).SetValidator(new PlanWorkoutInputValidator());
    }
}

public sealed class PlanStatusUpdateValidator : AbstractValidator<PlanStatusUpdate>
{
    public PlanStatusUpdateValidator()
    {
        RuleFor(request => request.Status).NotEmpty().MaximumLength(100);
    }
}

public sealed class PlanWorkoutInputValidator : AbstractValidator<PlanWorkoutInput>
{
    public PlanWorkoutInputValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Notes).MaximumLength(2000).When(request => request.Notes is not null);
        RuleFor(request => request.Id).NotEmpty().MaximumLength(100);
        RuleFor(request => request.UserId).MaximumLength(200).When(request => request.UserId is not null);
        RuleFor(request => request.Date).NotEmpty().MaximumLength(50);
        RuleForEach(request => request.Excercises).SetValidator(new RoutineExcerciseValidator());
    }
}