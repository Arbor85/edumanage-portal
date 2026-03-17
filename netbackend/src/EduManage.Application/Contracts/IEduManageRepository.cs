namespace EduManage.Application.Contracts;

public interface IEduManageRepository
{
    Task<IReadOnlyList<PlanOut>> ListPlansAsync(CancellationToken cancellationToken);
    Task<PlanOut> AddPlanAsync(PlanCreate request, CancellationToken cancellationToken);
    Task<PlanOut> GetPlanAsync(string planId, CancellationToken cancellationToken);
    Task<PlanOut> UpdatePlanAsync(string planId, PlanUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeletePlanAsync(string planId, CancellationToken cancellationToken);
    Task<PlanOut> UpdatePlanStatusAsync(string planId, PlanStatusUpdate request, CancellationToken cancellationToken);

    Task<IReadOnlyList<MeetingOut>> ListMeetingsAsync(CancellationToken cancellationToken);
    Task<MeetingOut> AddMeetingAsync(MeetingCreate request, CancellationToken cancellationToken);
    Task<MeetingOut> UpdateMeetingAsync(string meetingId, MeetingUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteMeetingAsync(string meetingId, CancellationToken cancellationToken);

    Task<IReadOnlyList<CourseOut>> ListCoursesAsync(CancellationToken cancellationToken);
    Task<CourseOut> AddCourseAsync(CourseCreate request, CancellationToken cancellationToken);
    Task<CourseOut> UpdateCourseAsync(string courseId, CourseUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteCourseAsync(string courseId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ClientOut>> ListClientsAsync(CancellationToken cancellationToken);
    Task<ClientOut> AddClientAsync(ClientCreate request, CancellationToken cancellationToken);
    Task<ClientOut> EditClientAsync(string invitationCode, ClientUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteClientAsync(string invitationCode, CancellationToken cancellationToken);
    Task<ClientOut> AcceptClientInvitationAsync(string invitationCode, AcceptClientInvitationRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<ExcerciseOut>> ListExcercisesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<RoutineOut>> ListRoutinesAsync(CancellationToken cancellationToken);
    Task<RoutineOut> AddRoutineAsync(RoutineCreate request, CancellationToken cancellationToken);
    Task<RoutineOut> UpdateRoutineAsync(string routineId, RoutineUpdate request, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> DeleteRoutineAsync(string routineId, CancellationToken cancellationToken);
    Task<WorkoutHistoryOut> CompleteRoutineAsync(CompleteRoutineCreate request, CancellationToken cancellationToken);
}