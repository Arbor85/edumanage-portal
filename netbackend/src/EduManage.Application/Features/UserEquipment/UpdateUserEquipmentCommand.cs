using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.UserEquipment;

public sealed record UpdateUserEquipmentCommand(string UserId, UserEquipmentBatchUpdate Request) : IRequest<IReadOnlyList<UserEquipmentOut>>
{
    internal sealed class Handler(IUserEquipmentRepository userEquipmentRepository, IEquipmentRepository equipmentRepository)
        : IRequestHandler<UpdateUserEquipmentCommand, IReadOnlyList<UserEquipmentOut>>
    {
        public async Task<IReadOnlyList<UserEquipmentOut>> Handle(UpdateUserEquipmentCommand request, CancellationToken cancellationToken)
        {
            var newItems = new List<EduManage.Domain.Entities.UserEquipment>();

            foreach (var save in request.Request.Equipment)
            {
                if (!Guid.TryParse(save.EquipmentId, out var equipmentId))
                    throw new ValidationException($"Invalid equipment ID: '{save.EquipmentId}'.");

                var equipment = await equipmentRepository.GetByIdAsync(equipmentId, cancellationToken)
                    ?? throw new NotFoundException($"Equipment '{save.EquipmentId}' was not found.");

                if (save.AvailableWeights is { Count: > 0 } && equipment.WeightOptions is not null)
                {
                    var invalid = save.AvailableWeights.Except(equipment.WeightOptions).ToList();
                    if (invalid.Count > 0)
                        throw new ValidationException(
                            $"Weight values [{string.Join(", ", invalid)}] are not available for equipment '{equipment.Name}'.");
                }

                newItems.Add(new EduManage.Domain.Entities.UserEquipment
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    EquipmentId = equipmentId,
                    Equipment = equipment,
                    AvailableWeights = save.AvailableWeights
                });
            }

            await userEquipmentRepository.ReplaceUserEquipmentAsync(request.UserId, newItems, cancellationToken);

            return newItems.Select(ue => new UserEquipmentOut(
                ue.EquipmentId.ToString(),
                ue.Equipment.Name,
                ue.Equipment.EquipmentType,
                ue.AvailableWeights)).ToList();
        }
    }
}
