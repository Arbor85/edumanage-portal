using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class MeetingCreateValidator : AbstractValidator<MeetingCreate>
{
    public MeetingCreateValidator()
    {
        RuleFor(request => request.ClientId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.StartsAt).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Price).GreaterThanOrEqualTo(0);
    }
}

public sealed class MeetingUpdateValidator : AbstractValidator<MeetingUpdate>
{
    public MeetingUpdateValidator()
    {
        RuleFor(request => request.ClientId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.StartsAt).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Price).GreaterThanOrEqualTo(0);
    }
}