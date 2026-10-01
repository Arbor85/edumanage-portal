using EduManage.Domain.Entities;

namespace EduManage.Application.Contracts;

public interface IUserProfileRepository : IRepository<UserProfile, string>
{
}
