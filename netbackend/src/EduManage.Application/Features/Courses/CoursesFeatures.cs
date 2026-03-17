using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Courses;

public sealed record ListCoursesQuery : IRequest<IReadOnlyList<CourseOut>>;
public sealed record AddCourseCommand(CourseCreate Request) : IRequest<CourseOut>;
public sealed record UpdateCourseCommand(string CourseId, CourseUpdate Request) : IRequest<CourseOut>;
public sealed record DeleteCourseCommand(string CourseId) : IRequest<Dictionary<string, string>>;

public sealed class ListCoursesHandler(IEduManageRepository repository) : IRequestHandler<ListCoursesQuery, IReadOnlyList<CourseOut>>
{
    public Task<IReadOnlyList<CourseOut>> Handle(ListCoursesQuery request, CancellationToken cancellationToken) => repository.ListCoursesAsync(cancellationToken);
}

public sealed class AddCourseHandler(IEduManageRepository repository) : IRequestHandler<AddCourseCommand, CourseOut>
{
    public Task<CourseOut> Handle(AddCourseCommand request, CancellationToken cancellationToken) => repository.AddCourseAsync(request.Request, cancellationToken);
}

public sealed class UpdateCourseHandler(IEduManageRepository repository) : IRequestHandler<UpdateCourseCommand, CourseOut>
{
    public Task<CourseOut> Handle(UpdateCourseCommand request, CancellationToken cancellationToken) => repository.UpdateCourseAsync(request.CourseId, request.Request, cancellationToken);
}

public sealed class DeleteCourseHandler(IEduManageRepository repository) : IRequestHandler<DeleteCourseCommand, Dictionary<string, string>>
{
    public Task<Dictionary<string, string>> Handle(DeleteCourseCommand request, CancellationToken cancellationToken) => repository.DeleteCourseAsync(request.CourseId, cancellationToken);
}