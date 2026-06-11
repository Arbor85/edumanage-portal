using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Equipment;

public sealed record AddEquipmentCommand(EquipmentWriteRequest Request) : IRequest<EquipmentOut>
{
    internal sealed class Handler(IEquipmentRepository repository) : IRequestHandler<AddEquipmentCommand, EquipmentOut>
    {
        public async Task<EquipmentOut> Handle(AddEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = new EduManage.Domain.Entities.Equipment
            {
                Id = Guid.NewGuid(),
                Name = request.Request.Name,
                EquipmentType = request.Request.EquipmentType,
                WeightOptions = request.Request.EquipmentType == EquipmentType.Bodyweight
                    ? null
                    : request.Request.WeightOptions
            };

            await repository.AddAsync(equipment, cancellationToken);
            return ListEquipmentQuery.Handler.ToOut(equipment);
        }
    }
}
