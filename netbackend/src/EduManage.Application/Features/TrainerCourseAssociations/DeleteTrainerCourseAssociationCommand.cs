using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.TrainerCourseAssociations;

public sealed record DeleteTrainerCourseAssociationCommand(string AssociationId) : IRequest<Dictionary<string, string>>
{
    internal sealed class Handler(ITrainerCourseAssociationRepository repo) : IRequestHandler<DeleteTrainerCourseAssociationCommand, Dictionary<string, string>>
    {
        public async Task<Dictionary<string, string>> Handle(DeleteTrainerCourseAssociationCommand request, CancellationToken cancellationToken)
        {
            await repo.DeleteByIdAsync(request.AssociationId, cancellationToken);
            return new Dictionary<string, string> { ["message"] = "Deleted." };
        }
    }
}
