using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.UserEquipment;

public sealed record GetUserEquipmentQuery(string UserId) : IRequest<IReadOnlyList<UserEquipmentOut>>
{
    internal sealed class Handler(IUserEquipmentRepository repository) : IRequestHandler<GetUserEquipmentQuery, IReadOnlyList<UserEquipmentOut>>
    {
        public async Task<IReadOnlyList<UserEquipmentOut>> Handle(GetUserEquipmentQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.GetByUserIdAsync(request.UserId, cancellationToken);
            return items.Select(ue => new UserEquipmentOut(
                ue.EquipmentId.ToString(),
                ue.Equipment.Name,
                ue.Equipment.EquipmentType,
                ue.AvailableWeights)).ToList();
        }
    }
}
