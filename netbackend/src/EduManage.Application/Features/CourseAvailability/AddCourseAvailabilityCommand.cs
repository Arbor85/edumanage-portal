using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.CourseAvailability;

public sealed record AddCourseAvailabilityCommand(string CourseId, CourseAvailabilityCreate Request) : IRequest<CourseAvailabilityOut>
{
    internal sealed class Handler(ICourseAvailabilityRepository repo) : IRequestHandler<AddCourseAvailabilityCommand, CourseAvailabilityOut>
    {
        public async Task<CourseAvailabilityOut> Handle(AddCourseAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var entity = new Domain.Entities.CourseAvailability
            {
                Id = Guid.NewGuid().ToString("N"),
                CourseId = request.CourseId,
                DaysOfWeek = [.. request.Request.DaysOfWeek],
                StartTime = request.Request.StartTime,
                EndTime = request.Request.EndTime,
                ValidFrom = string.IsNullOrEmpty(request.Request.ValidFrom) ? null : request.Request.ValidFrom,
                ValidTo = string.IsNullOrEmpty(request.Request.ValidTo) ? null : request.Request.ValidTo
            };
            await repo.AddAsync(entity, cancellationToken);
            return new CourseAvailabilityOut(entity.Id, entity.CourseId, entity.DaysOfWeek, entity.StartTime, entity.EndTime, entity.ValidFrom, entity.ValidTo);
        }
    }
}
