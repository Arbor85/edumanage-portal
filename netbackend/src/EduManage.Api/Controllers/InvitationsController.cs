using EduManage.Api.Services;
using EduManage.Application.Contracts;
using EduManage.Application.Features.Clients;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduManage.Api.Controllers;

[Authorize]
[Route("api/invitations")]
public class InvitationsController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    [Route("{invitationCode}")]
    public Task<InvitationOut> GetInvitation(string invitationCode, CancellationToken cancellationToken) =>
        mediator.Send(new GetInvitationQuery(invitationCode), cancellationToken);

    [HttpPost]
    [Authorize]
    [Route("{invitationCode}/accept")]
    public Task AcceptInvitation(string invitationCode, [FromBody] AcceptInvitationRequest request, CancellationToken cancellationToken)
    {
        if (!string.Equals(invitationCode, request.InvitationCode, StringComparison.OrdinalIgnoreCase))
            return Task.FromException(new ValidationException([new FluentValidation.Results.ValidationFailure("invitationCode", "Invitation code in the URL and request body must match.")]));

        return mediator.Send(new AcceptInvitationCommand(
            request.InvitationCode,
            request.ImageUrl,
            request.Email,
            request.FirstName,
            request.LastName,
            request.Gender,
            currentUserService.GetCurrentUserId()!), cancellationToken);
    }

    public record AcceptInvitationRequest(
        string InvitationCode,
        string ImageUrl,
        string? Email,
        string? FirstName,
        string? LastName,
        string? Gender);

    public class AcceptInvitationRequestValidator : AbstractValidator<AcceptInvitationRequest>
    {
        private static readonly string[] AllowedGenders = ["male", "female", "other"];

        public AcceptInvitationRequestValidator()
        {
            RuleFor(r => r.InvitationCode).NotEmpty();
            RuleFor(r => r.ImageUrl).NotEmpty().Must(uri => Uri.IsWellFormedUriString(uri, UriKind.Absolute)).WithMessage("ImageUrl must be a valid URL.");
            RuleFor(r => r.Email).EmailAddress().When(r => r.Email is not null).WithMessage("Email must be a valid email address.");
            RuleFor(r => r.FirstName).MaximumLength(100).When(r => r.FirstName is not null);
            RuleFor(r => r.LastName).MaximumLength(100).When(r => r.LastName is not null);
            RuleFor(r => r.Gender).Must(g => AllowedGenders.Contains(g, StringComparer.OrdinalIgnoreCase)).When(r => r.Gender is not null).WithMessage("Gender must be one of: male, female, other.");
        }
    }
}
