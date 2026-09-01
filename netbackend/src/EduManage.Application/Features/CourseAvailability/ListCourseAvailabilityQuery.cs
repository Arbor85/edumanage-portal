using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.CourseAvailability;

public sealed record ListCourseAvailabilityQuery(string CourseId) : IRequest<IReadOnlyList<CourseAvailabilityOut>>
{
    internal sealed class Handler(ICourseAvailabilityRepository repo) : IRequestHandler<ListCourseAvailabilityQuery, IReadOnlyList<CourseAvailabilityOut>>
    {
        public async Task<IReadOnlyList<CourseAvailabilityOut>> Handle(ListCourseAvailabilityQuery request, CancellationToken cancellationToken)
        {
            var items = await repo.ListByCourseAsync(request.CourseId, cancellationToken);
            return items.Select(a => new CourseAvailabilityOut(a.Id, a.CourseId, a.DaysOfWeek, a.StartTime, a.EndTime, a.ValidFrom, a.ValidTo)).ToList();
        }
    }
}
