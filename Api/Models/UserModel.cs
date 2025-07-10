using System.Text.Json.Serialization;

namespace Api.Models;

public class UserModel
{
  public int Id { get; set; }

  public required string Email { get; set; }

  public required string FirstName { get; set; }

  public required string LastName { get; set; }

  public ShoppingCartModel ShoppingCart { get; set; } = null!;

  public required UserRole Role { get; set; }

  public required string PasswordHash { get; set; }

  public required DateTime CreatedAt { get; set; }

  public required ICollection<OrderModel> Orders { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter<UserRole>))]
public enum UserRole
{
  Customer,
  Admin,
}
