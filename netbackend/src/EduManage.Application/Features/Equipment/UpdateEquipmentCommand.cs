using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Equipment;

public sealed record UpdateEquipmentCommand(Guid Id, EquipmentWriteRequest Request) : IRequest<EquipmentOut>
{
    internal sealed class Handler(IEquipmentRepository repository) : IRequestHandler<UpdateEquipmentCommand, EquipmentOut>
    {
        public async Task<EquipmentOut> Handle(UpdateEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Equipment '{request.Id}' was not found.");

            if (equipment.IsCore &&
                (equipment.Name != request.Request.Name || equipment.EquipmentType != request.Request.EquipmentType))
                throw new ValidationException($"Core equipment '{equipment.Name}' cannot have its name or type changed.");

            equipment.Name = request.Request.Name;
            equipment.EquipmentType = request.Request.EquipmentType;
            equipment.WeightOptions = request.Request.EquipmentType == EquipmentType.Bodyweight
                ? null
                : request.Request.WeightOptions;

            await repository.UpdateAsync(equipment, cancellationToken);
            return ListEquipmentQuery.Handler.ToOut(equipment);
        }
    }
}
