using Api.Dtos.User;

namespace Api.Services.User;

public class CustomerStrategy : IUserStrategy
{
  public async Task<CreateUserResult> CreateUserAsync(CreateUserRequest req)
  {
    return CreateUserResult.Success();
  }
}

