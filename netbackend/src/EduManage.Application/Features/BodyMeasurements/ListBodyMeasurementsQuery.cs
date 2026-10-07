using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.BodyMeasurements;

public sealed record ListBodyMeasurementsQuery(string UserId) : IRequest<IReadOnlyList<BodyMeasurementOut>>
{
    internal sealed class Handler(IBodyMeasurementRepository repository)
        : IRequestHandler<ListBodyMeasurementsQuery, IReadOnlyList<BodyMeasurementOut>>
    {
        public async Task<IReadOnlyList<BodyMeasurementOut>> Handle(ListBodyMeasurementsQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.GetByUserIdAsync(request.UserId, cancellationToken);
            return items.Select(m => new BodyMeasurementOut(
                m.Id, m.Date.ToString("yyyy-MM-dd"),
                m.WeightKg, m.WaistCm, m.ThighCm, m.BicepCm, m.ChestCm, m.ButtCm,
                m.SystolicMmHg, m.DiastolicMmHg)).ToList();
        }
    }
}
