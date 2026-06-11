using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Equipment;

public sealed record ListEquipmentQuery : IRequest<IReadOnlyList<EquipmentOut>>
{
    internal sealed class Handler(IEquipmentRepository repository) : IRequestHandler<ListEquipmentQuery, IReadOnlyList<EquipmentOut>>
    {
        public async Task<IReadOnlyList<EquipmentOut>> Handle(ListEquipmentQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.ListAsync(cancellationToken);
            return items.Select(ToOut).ToList();
        }

        internal static EquipmentOut ToOut(EduManage.Domain.Entities.Equipment e) =>
            new(e.Id.ToString(), e.Name, e.EquipmentType, e.WeightOptions, e.IsCore);
    }
}
