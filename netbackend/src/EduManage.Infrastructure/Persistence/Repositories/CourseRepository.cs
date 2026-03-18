using EduManage.Application.Common.Exceptions;
using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence.Repositories;

internal sealed class CourseRepository : ICourseRepository
{
    private readonly EduManageDbContext _context;

    public CourseRepository(EduManageDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken)
    {
        var courses = await _context.Courses.ToListAsync(cancellationToken);
        return courses.Select(c => new CourseOut(
            c.Id,
            c.UserId,
            c.Name,
            c.Type,
            c.Size,
            new CoursePrice(c.PriceValue, c.PriceCurrency),
            c.Description
        )).ToList();
    }

    public async Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken)
    {
        var course = new Course
        {
            Id = Guid.NewGuid().ToString("N"),
            UserId = "local-user",
            Name = request.Name,
            Type = request.Type,
            Size = request.Size,
            PriceValue = request.Price.Value,
            PriceCurrency = request.Price.Currency,
            Description = request.Description
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync(cancellationToken);

        return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size,
            new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
    }

    public async Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses.FindAsync([courseId], cancellationToken: cancellationToken);
        if (course is null)
            throw new NotFoundException($"Course '{courseId}' was not found.");

        course.Name = request.Name;
        course.Type = request.Type;
        course.Size = request.Size;
        course.PriceValue = request.Price.Value;
        course.PriceCurrency = request.Price.Currency;
        course.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);

        return new CourseOut(course.Id, course.UserId, course.Name, course.Type, course.Size,
            new CoursePrice(course.PriceValue, course.PriceCurrency), course.Description);
    }

    public async Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken)
    {
        var course = await _context.Courses.FindAsync([courseId], cancellationToken: cancellationToken);
        if (course is null)
            throw new NotFoundException($"Course '{courseId}' was not found.");

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync(cancellationToken);

        return new Dictionary<string, string> { ["detail"] = "Course deleted" };
    }
}
