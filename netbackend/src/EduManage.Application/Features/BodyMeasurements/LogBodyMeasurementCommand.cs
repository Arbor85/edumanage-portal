using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.BodyMeasurements;

public sealed record LogBodyMeasurementCommand(string UserId, BodyMeasurementCreate Request) : IRequest<BodyMeasurementOut>
{
    internal sealed class Handler(IBodyMeasurementRepository repository)
        : IRequestHandler<LogBodyMeasurementCommand, BodyMeasurementOut>
    {
        public async Task<BodyMeasurementOut> Handle(LogBodyMeasurementCommand request, CancellationToken cancellationToken)
        {
            var measurement = new BodyMeasurement
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = request.UserId,
                Date = DateOnly.Parse(request.Request.Date),
                WeightKg = request.Request.WeightKg,
                WaistCm = request.Request.WaistCm,
                ThighCm = request.Request.ThighCm,
                BicepCm = request.Request.BicepCm,
                ChestCm = request.Request.ChestCm,
                ButtCm = request.Request.ButtCm,
                SystolicMmHg = request.Request.SystolicMmHg,
                DiastolicMmHg = request.Request.DiastolicMmHg,
            };

            await repository.AddAsync(measurement, cancellationToken);

            return new BodyMeasurementOut(
                measurement.Id, measurement.Date.ToString("yyyy-MM-dd"),
                measurement.WeightKg, measurement.WaistCm, measurement.ThighCm,
                measurement.BicepCm, measurement.ChestCm, measurement.ButtCm,
                measurement.SystolicMmHg, measurement.DiastolicMmHg);
        }
    }
}
