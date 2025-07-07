using Api.Models;

namespace Api.Dtos.User;

public class CreateUserRequest
{
  public required string Email { get; set; }

  public required string FirstName { get; set; }

  public required string LastName { get; set; }

  public required UserRole Role { get; set; }

  public required string Password { get; set; }
}
