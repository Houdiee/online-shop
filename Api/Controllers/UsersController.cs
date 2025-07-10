using Api.Data;
using Api.Dtos.User;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Resend;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(ApiDbContext context, IResend resend) : ControllerBase
{
  private readonly ApiDbContext _context = context;
  private readonly IResend _resend = resend;

  [HttpPost]
  public async Task<IActionResult> CreateNewUser([FromBody] CreateUserRequest req)
  {
    UserModel? existingUser = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == req.Email);

    if (existingUser != null)
    {
      if (existingUser.Role == UserRole.Customer && req.Role == UserRole.Admin)
      {
        return await RequestAdminAccessAsync(req);
      }
      else if (existingUser.Role == UserRole.Admin)
      {
        return BadRequest(new { message = "User with this email is already an admin." });
      }
      else if (existingUser.Role == UserRole.Customer && req.Role == UserRole.Customer)
      {
        return BadRequest(new { message = "User with this email already has a customer account." });
      }
    }

    if (req.Role == UserRole.Admin)
    {
      return BadRequest(new { message = "Admin accounts cannot be created directly. Please register as a customer first and then request admin access." });
    }

    return await CreateCustomerUserAsync(req);
  }

  private async Task<IActionResult> RequestAdminAccessAsync(CreateUserRequest req)
  {
    UserModel? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

    if (user == null)
    {
      return NotFound(new { message = "User not found for admin access request." });
    }

    user.Role = UserRole.Admin;
    _context.Users.Update(user);

    await _context.SaveChangesAsync();

    EmailMessage email = new()
    {
      From = "OmniShop no-reply@formview.org",
      To = req.Email,
      Subject = "Admin Request Successful",
      TextBody = $"You now have admin access with the registered email ${req.Email}",
    };

    await _resend.EmailSendAsync(email);

    return Ok(new { message = $"User with email {req.Email} successfully upgraded to admin" });
  }

  private async Task<IActionResult> CreateCustomerUserAsync(CreateUserRequest req)
  {
    UserModel? existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
    if (existingUser != null)
    {
      return BadRequest(new { message = "User with this email already has an account." });
    }

    var newUser = new UserModel
    {
      Email = req.Email,
      FirstName = req.FirstName,
      LastName = req.LastName,
      PasswordHash = req.Password,
      Role = UserRole.Customer,
      CreatedAt = DateTime.UtcNow,
      Orders = [],
    };

    ShoppingCartModel newShoppingCart = new()
    {
      UserId = newUser.Id,
      Items = [],
    };
    newUser.ShoppingCart = newShoppingCart;

    _context.Users.Add(newUser);

    try
    {
      await _context.SaveChangesAsync();
      return CreatedAtAction(
        nameof(CreateNewUser),
        new { userId = newUser.Id },
        new { message = "Customer account created successfully.", userId = newUser.Id }
      );
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error creating customer user: {e}");
      return StatusCode(
          StatusCodes.Status500InternalServerError,
          new { message = "An unexpected problem occurred while creating the user account." }
      );
    }
  }

  [HttpGet("{userId}")]
  public async Task<IActionResult> GetUser(int userId)
  {
    UserModel? user = await _context.Users
      .Include(u => u.ShoppingCart)
        .ThenInclude(sh => sh.Items)
      .Include(u => u.Orders)
        .ThenInclude(o => o.OrderItems)
          .ThenInclude(oi => oi.ProductVariant)
      .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null)
    {
      return NotFound(new { message = $"User with id {userId} does not exist." });
    }

    return Ok(user);
  }

  [HttpDelete("{userId}")]
  public async Task<IActionResult> DeleteUser(int userId)
  {
    UserModel? user = await _context.Users.FindAsync(userId);
    if (user == null)
    {
      return NotFound(new { message = $"User with id {userId} does not exist." });
    }

    _context.Users.Remove(user);

    try
    {
      await _context.SaveChangesAsync();
      return Ok(new { message = $"User with id {userId} deleted successfully." });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error deleting user: {e}");
      return StatusCode(
          StatusCodes.Status500InternalServerError,
          new { message = "An unexpected problem occurred while deleting the user." }
      );
    }
  }
}
