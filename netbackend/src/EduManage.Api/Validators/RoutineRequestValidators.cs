using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class RoutineCreateValidator : AbstractValidator<RoutineCreate>
{
    public RoutineCreateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Notes).MaximumLength(2000).When(request => request.Notes is not null);
        RuleForEach(request => request.Excercises).SetValidator(new RoutineExcerciseValidator());
    }
}

public sealed class RoutineUpdateValidator : AbstractValidator<RoutineUpdate>
{
    public RoutineUpdateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Notes).MaximumLength(2000).When(request => request.Notes is not null);
        RuleForEach(request => request.Excercises).SetValidator(new RoutineExcerciseValidator());
    }
}

public sealed class RoutineExcerciseValidator : AbstractValidator<RoutineExcercise>
{
    public RoutineExcerciseValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleForEach(request => request.Sets).SetValidator(new RoutineSetValidator());
    }
}

public sealed class RoutineSetValidator : AbstractValidator<RoutineSet>
{
    public RoutineSetValidator()
    {
        RuleFor(request => request.Type).NotEmpty().MaximumLength(50);
        RuleFor(request => request.Reps).GreaterThanOrEqualTo(0).When(request => request.Reps.HasValue);
        RuleFor(request => request.Weight).GreaterThanOrEqualTo(0).When(request => request.Weight.HasValue);
        RuleFor(request => request.Notes).MaximumLength(1000).When(request => request.Notes is not null);
    }
}

public sealed class CompleteRoutineCreateValidator : AbstractValidator<CompleteRoutineCreate>
{
    public CompleteRoutineCreateValidator()
    {
        RuleFor(request => request.Mode).NotEmpty().MaximumLength(100);
        RuleFor(request => request.StartedAt).NotEmpty().MaximumLength(100);
        RuleFor(request => request.CompletedAt).NotEmpty().MaximumLength(100);
        RuleFor(request => request.DurationSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.TotalSets).GreaterThanOrEqualTo(0);
        RuleFor(request => request.CompletedSets).GreaterThanOrEqualTo(0);
        RuleFor(request => request.CompletedSets).LessThanOrEqualTo(request => request.TotalSets);

        RuleForEach(request => request.Excercises).SetValidator(new CompletedRoutineExcerciseValidator()).When(request => request.Excercises is not null);
        RuleForEach(request => request.Exercises).SetValidator(new CompletedRoutineExcerciseValidator()).When(request => request.Exercises is not null);

        RuleFor(request => request.SourceWorkout).SetValidator(new CompletedSourceWorkoutValidator());
    }
}

public sealed class CompletedRoutineExcerciseValidator : AbstractValidator<CompletedRoutineExcercise>
{
    public CompletedRoutineExcerciseValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleForEach(request => request.Sets).SetValidator(new CompletedRoutineSetValidator());
    }
}

public sealed class CompletedRoutineSetValidator : AbstractValidator<CompletedRoutineSet>
{
    public CompletedRoutineSetValidator()
    {
        RuleFor(request => request.Type).NotEmpty().MaximumLength(50);
        RuleFor(request => request.Reps).GreaterThanOrEqualTo(0).When(request => request.Reps.HasValue);
        RuleFor(request => request.Weight).GreaterThanOrEqualTo(0).When(request => request.Weight.HasValue);
        RuleFor(request => request.Notes).MaximumLength(1000).When(request => request.Notes is not null);
    }
}

public sealed class CompletedSourceWorkoutValidator : AbstractValidator<CompletedSourceWorkout>
{
    public CompletedSourceWorkoutValidator()
    {
        RuleFor(request => request.Id).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Date).NotEmpty().MaximumLength(50);
    }
}