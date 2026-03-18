using EduManage.Application.Contracts;
using FluentValidation;

namespace EduManage.Api.Validators;

public sealed class ClientCreateValidator : AbstractValidator<ClientCreate>
{
    public ClientCreateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.ImageUrl).MaximumLength(500);
        RuleFor(request => request.Status).NotEmpty().MaximumLength(100);
        RuleFor(request => request.InvitationCode).MaximumLength(50);
        RuleForEach(request => request.Tags).MaximumLength(50);
    }
}

public sealed class ClientUpdateValidator : AbstractValidator<ClientUpdate>
{
    public ClientUpdateValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.ImageUrl).MaximumLength(500);
        RuleFor(request => request.Status).NotEmpty().MaximumLength(100);
        RuleFor(request => request.InvitationCode).NotEmpty().MaximumLength(50);
        RuleForEach(request => request.Tags).MaximumLength(50);
    }
}

public sealed class AcceptClientInvitationRequestValidator : AbstractValidator<AcceptClientInvitationRequest>
{
    public AcceptClientInvitationRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(request => request.ImageUrl).MaximumLength(500);
    }
}