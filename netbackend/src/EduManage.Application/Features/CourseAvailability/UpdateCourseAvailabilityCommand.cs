using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.CourseAvailability;

public sealed record UpdateCourseAvailabilityCommand(string AvailabilityId, CourseAvailabilityUpdate Request) : IRequest<CourseAvailabilityOut>
{
    internal sealed class Handler(ICourseAvailabilityRepository repo) : IRequestHandler<UpdateCourseAvailabilityCommand, CourseAvailabilityOut>
    {
        public async Task<CourseAvailabilityOut> Handle(UpdateCourseAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var entity = await repo.GetByIdAsync(request.AvailabilityId, cancellationToken)
                ?? throw new NotFoundException($"Availability '{request.AvailabilityId}' not found.");
            entity.DaysOfWeek = [.. request.Request.DaysOfWeek];
            entity.StartTime = request.Request.StartTime;
            entity.EndTime = request.Request.EndTime;
            entity.ValidFrom = string.IsNullOrEmpty(request.Request.ValidFrom) ? null : request.Request.ValidFrom;
            entity.ValidTo = string.IsNullOrEmpty(request.Request.ValidTo) ? null : request.Request.ValidTo;
            await repo.UpdateAsync(entity, cancellationToken);
            return new CourseAvailabilityOut(entity.Id, entity.CourseId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
