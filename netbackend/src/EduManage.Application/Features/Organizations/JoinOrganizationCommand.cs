using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Organizations;

public sealed record JoinOrganizationCommand(
    string TrainerUserId,
    string InviteCode,
    string? FirstName = null,
    string? LastName = null,
    IReadOnlyList<AvailabilityCreate>? InitialAvailabilities = null) : IRequest<OrganizationMemberOut>
{
    internal sealed class Handler(
        IOrganizationRepository orgRepo,
        IOrganizationMembershipRepository memberRepo,
        ITrainerAvailabilityRepository availabilityRepo)
        : IRequestHandler<JoinOrganizationCommand, OrganizationMemberOut>
    {
        public async Task<OrganizationMemberOut> Handle(JoinOrganizationCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByInviteCodeAsync(request.InviteCode, cancellationToken)
                ?? throw new NotFoundException("Invalid invite code.");

            var existing = await memberRepo.GetByTrainerAndOrgAsync(request.TrainerUserId, org.Id, cancellationToken);
            if (existing is not null)
                return new OrganizationMemberOut(existing.TrainerUserId, existing.JoinedAt, existing.FirstName, existing.LastName);

            var membership = new OrganizationMembership
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                TrainerUserId = request.TrainerUserId,
                JoinedAt = DateTime.UtcNow.ToString("O"),
                FirstName = request.FirstName,
                LastName = request.LastName
            };
            await memberRepo.AddAsync(membership, cancellationToken);

            if (request.InitialAvailabilities is { Count: > 0 })
            {
                foreach (var a in request.InitialAvailabilities)
                {
                    var slot = new Domain.Entities.TrainerAvailability
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        OrganizationId = org.Id,
                        TrainerUserId = request.TrainerUserId,
                        DaysOfWeek = [.. a.DaysOfWeek],
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        ValidFrom = string.IsNullOrEmpty(a.ValidFrom) ? null : a.ValidFrom,
                        ValidTo = string.IsNullOrEmpty(a.ValidTo) ? null : a.ValidTo
                    };
                    await availabilityRepo.AddAsync(slot, cancellationToken);
                }
            }

            return new OrganizationMemberOut(membership.TrainerUserId, membership.JoinedAt, membership.FirstName, membership.LastName);
        }
    }
}
