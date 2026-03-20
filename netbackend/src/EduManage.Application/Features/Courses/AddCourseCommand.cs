using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record AddCourseCommand(CourseCreate Request) : IRequest<CourseOut>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<AddCourseCommand, CourseOut>
    {
        public async Task<CourseOut> Handle(AddCourseCommand request, CancellationToken cancellationToken)
        {
            var course = new Course
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = "local-user",
                Name = request.Request.Name,
                Type = request.Request.Type,
                Size = request.Request.Size,
                PriceValue = request.Request.Price.Value,
                PriceCurrency = request.Request.Price.Currency,
                Description = request.Request.Description
            };

            await repository.AddAsync(course, cancellationToken);
            return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size,
                new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
        }
    }
}