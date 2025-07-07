using Api.Dtos.User;
using Api.Models;

namespace Api.Services.User;

public class UserService
{
  public async Task<CreateUserResult> CreateUserAsync(CreateUserRequest request)
  {
    IUserStrategy strategy = request.Role switch
    {
      UserRole.Customer => new CustomerStrategy(),
      UserRole.Admin => new AdminStrategy(),
      _ => throw new Exception("Invalid UserRole type"),
    };

    return await strategy.CreateUserAsync(request);
  }
}
