namespace EduManage.Domain.Entities;

public class TrainerCourseAssociation
{
    public string Id { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string TrainerUserId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
}
