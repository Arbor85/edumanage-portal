using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using MediatR;

namespace EduManage.Application.Features.TrainerCourseAssociations;

public sealed record ListTrainerCourseAssociationsQuery(string OwnerId) : IRequest<IReadOnlyList<TrainerCourseAssociationOut>>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ITrainerCourseAssociationRepository repo)
        : IRequestHandler<ListTrainerCourseAssociationsQuery, IReadOnlyList<TrainerCourseAssociationOut>>
    {
        public async Task<IReadOnlyList<TrainerCourseAssociationOut>> Handle(ListTrainerCourseAssociationsQuery request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var items = await repo.ListByOrganizationAsync(org.Id, cancellationToken);
            return items.Select(a => new TrainerCourseAssociationOut(a.Id, a.OrganizationId, a.TrainerUserId, a.CourseId)).ToList();
        }
    }
}
