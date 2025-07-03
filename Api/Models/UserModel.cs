namespace Api.Models;

public class UserModel
{
    public int Id { get; set; }

    public required string Email { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required ShoppingCartModel ShoppingCart { get; set; }

    public required UserRole Role { get; set; }

    public required string PasswordHash { get; set; }

    public required DateTime CreatedAt { get; set; }
}

public enum UserRole
{
    Customer,
    Admin,
}
