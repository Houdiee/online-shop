using Api.Dtos.User;

namespace Api.Services.User;

public class AdminStrategy : IUserStrategy
{
  public async Task<CreateUserResult> CreateUserAsync(CreateUserRequest req)
  {
    return CreateUserResult.Success();
  }
}

