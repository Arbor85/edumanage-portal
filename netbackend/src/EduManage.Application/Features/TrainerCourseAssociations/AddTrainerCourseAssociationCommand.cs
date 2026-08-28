using EduManage.Application.Contracts;
using EduManage.Application.Common.Exceptions;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.TrainerCourseAssociations;

public sealed record AddTrainerCourseAssociationCommand(string OwnerId, TrainerCourseAssociationCreate Request) : IRequest<TrainerCourseAssociationOut>
{
    internal sealed class Handler(IOrganizationRepository orgRepo, ITrainerCourseAssociationRepository repo)
        : IRequestHandler<AddTrainerCourseAssociationCommand, TrainerCourseAssociationOut>
    {
        public async Task<TrainerCourseAssociationOut> Handle(AddTrainerCourseAssociationCommand request, CancellationToken cancellationToken)
        {
            var org = await orgRepo.GetByOwnerIdAsync(request.OwnerId, cancellationToken)
                ?? throw new NotFoundException("Organization not found.");
            var entity = new TrainerCourseAssociation
            {
                Id = Guid.NewGuid().ToString("N"),
                OrganizationId = org.Id,
                TrainerUserId = request.Request.TrainerId,
                CourseId = request.Request.CourseId
            };
            await repo.AddAsync(entity, cancellationToken);
            return new TrainerCourseAssociationOut(entity.Id, entity.OrganizationId, entity.TrainerUserId, entity.CourseId);
        }
    }
}
