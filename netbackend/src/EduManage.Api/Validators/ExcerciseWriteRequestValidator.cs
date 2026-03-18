using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class ExcerciseWriteRequestValidator : AbstractValidator<ExcerciseWriteRequest>
{
    public ExcerciseWriteRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(request => request.PrimaryMuscle)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(request => request.ShortDescription)
            .MaximumLength(500)
            .When(request => !string.IsNullOrWhiteSpace(request.ShortDescription));

        RuleForEach(request => request.Tags)
            .MaximumLength(50)
            .When(request => request.Tags is not null);

        RuleForEach(request => request.SecondaryMuscles)
            .MaximumLength(120)
            .When(request => request.SecondaryMuscles is not null);
    }
}