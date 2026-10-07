using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.BodyMeasurements;

public sealed record DeleteBodyMeasurementCommand(string Id, string UserId) : IRequest
{
    internal sealed class Handler(IBodyMeasurementRepository repository)
        : IRequestHandler<DeleteBodyMeasurementCommand>
    {
        public async Task Handle(DeleteBodyMeasurementCommand request, CancellationToken cancellationToken)
        {
            var measurement = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Body measurement '{request.Id}' was not found.");

            if (measurement.UserId != request.UserId)
                throw new NotFoundException($"Body measurement '{request.Id}' was not found.");

            await repository.DeleteAsync(measurement, cancellationToken);
        }
    }
}
