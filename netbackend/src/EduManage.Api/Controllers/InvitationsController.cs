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
    public Task AcceptInvitation([FromBody] AcceptInvitationRequest request, CancellationToken cancellationToken) =>
        mediator.Send(new AcceptInvitationCommand(request.InvitationCode, request.ImageUrl, currentUserService.GetCurrentUserId()!), cancellationToken);

    public record AcceptInvitationRequest(string InvitationCode, string ImageUrl);

    public class AcceptInvitationRequestValidator:  AbstractValidator<AcceptInvitationRequest>
    {
        public AcceptInvitationRequestValidator()
        {
            RuleFor(r => r.InvitationCode).NotEmpty();
            RuleFor(r => r.ImageUrl).NotEmpty().Must(uri => Uri.IsWellFormedUriString(uri, UriKind.Absolute)).WithMessage("ImageUrl must be a valid URL.");
        }
    }
}
