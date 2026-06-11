using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Equipment;

public sealed record DeleteEquipmentCommand(Guid Id) : IRequest
{
    internal sealed class Handler(IEquipmentRepository repository) : IRequestHandler<DeleteEquipmentCommand>
    {
        public async Task Handle(DeleteEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Equipment '{request.Id}' was not found.");

            if (equipment.IsCore)
                throw new ValidationException($"Core equipment '{equipment.Name}' cannot be deleted.");

            await repository.DeleteByIdAsync(request.Id, cancellationToken);
        }
    }
}
