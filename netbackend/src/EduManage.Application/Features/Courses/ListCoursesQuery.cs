using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record ListCoursesQuery : IRequest<IReadOnlyList<CourseOut>>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<ListCoursesQuery, IReadOnlyList<CourseOut>>
    {
        public async Task<IReadOnlyList<CourseOut>> Handle(ListCoursesQuery request, CancellationToken cancellationToken)
        {
            var courses = await repository.ListAsync(cancellationToken);
            return courses.Select(c => new CourseOut(
                c.Id, c.UserId, c.Name, c.Type, c.Size,
                new CoursePrice(c.PriceValue, c.PriceCurrency), c.Description)).ToList();
        }
    }
}