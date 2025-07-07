using Api.Dtos.User;

namespace Api.Services.User;

public interface IUserStrategy
{
  Task<CreateUserResult> CreateUserAsync(CreateUserRequest req);
}
