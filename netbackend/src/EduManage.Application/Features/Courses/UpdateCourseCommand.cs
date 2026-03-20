using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record UpdateCourseCommand(string CourseId, CourseUpdate Request) : IRequest<CourseOut>
{
    internal sealed class Handler(ICourseRepository repository) : IRequestHandler<UpdateCourseCommand, CourseOut>
    {
        public async Task<CourseOut> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await repository.GetByIdAsync(request.CourseId, cancellationToken)
                ?? throw new NotFoundException($"Course '{request.CourseId}' was not found.");

            course.Name = request.Request.Name;
            course.Type = request.Request.Type;
            course.Size = request.Request.Size;
            course.PriceValue = request.Request.Price.Value;
            course.PriceCurrency = request.Request.Price.Currency;
            course.Description = request.Request.Description;

            await repository.UpdateAsync(course, cancellationToken);
            return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size,
                new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
        }
    }
}