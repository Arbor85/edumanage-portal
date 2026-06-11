using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class EquipmentWriteRequestValidator : AbstractValidator<EquipmentWriteRequest>
{
    public EquipmentWriteRequestValidator()
    {
        RuleFor(r => r.Name).NotEmpty().MaximumLength(100);
        RuleFor(r => r.EquipmentType).IsInEnum();

        RuleFor(r => r.WeightOptions)
            .Must(w => w is null || w.Count == 0)
            .When(r => r.EquipmentType == EquipmentType.Bodyweight)
            .WithMessage("WeightOptions must be null or empty when EquipmentType is bodyweight.");

        RuleForEach(r => r.WeightOptions)
            .GreaterThan(0)
            .When(r => r.EquipmentType == EquipmentType.Weight && r.WeightOptions is not null);
    }
}
