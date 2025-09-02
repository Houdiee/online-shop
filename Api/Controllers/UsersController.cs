using System.Security.Claims;
using Api.Data;
using Api.Dtos.User;
using Api.Filters;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(ApiDbContext context) : ControllerBase
{
  private readonly ApiDbContext _context = context;

  [HttpPost]
  public async Task<IActionResult> CreateNewUser([FromBody] CreateUserRequest req)
  {
    UserModel? existingUser = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == req.Email);

    if (existingUser != null)
    {
      return BadRequest(new { message = "User with this email already has an account." });
    }

    return await CreateCustomerUserAsync(req);
  }

  private async Task<IActionResult> CreateCustomerUserAsync(CreateUserRequest req)
  {
    var newUser = new UserModel
    {
      Email = req.Email,
      FirstName = req.FirstName,
      LastName = req.LastName,
      PasswordHash = req.Password,
      Role = UserRole.Customer,
      CreatedAt = DateTime.UtcNow,
      Orders = [],
      IsPendingAdmin = false,
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

  [HttpPost("request-admin-access")]
  [Authorize]
  [ServiceFilter(typeof(VerifyUserExistsAttribute))]
  public async Task<IActionResult> RequestAdminAccess()
  {
    UserModel? user = (UserModel)HttpContext.Items["user"]!;

    if (user.Role != UserRole.Customer)
    {
        return BadRequest(new { message = "Only customers can request admin access." });
    }

    if (user.IsPendingAdmin)
    {
        return BadRequest(new { message = "Admin access request already pending." });
    }

    user.IsPendingAdmin = true;
    _context.Users.Update(user);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Admin access request submitted successfully." });
  }

  [HttpPost("approve-admin-access/{userId}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> ApproveAdminAccess(int userId)
  {
    UserModel? user = await _context.Users.FindAsync(userId);
    if (user == null)
    {
        return NotFound(new { message = "User not found." });
    }

    if (user.Role == UserRole.Admin)
    {
        return BadRequest(new { message = "User is already an admin." });
    }

    if (!user.IsPendingAdmin)
    {
        return BadRequest(new { message = "User has not requested admin access." });
    }

    user.Role = UserRole.Admin;
    user.IsPendingAdmin = false;
    _context.Users.Update(user);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Admin access approved successfully." });
  }

  [HttpPost("reject-admin-access/{userId}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> RejectAdminAccess(int userId)
  {
    UserModel? user = await _context.Users.FindAsync(userId);
    if (user == null)
    {
        return NotFound(new { message = "User not found." });
    }

    if (!user.IsPendingAdmin)
    {
        return BadRequest(new { message = "User has not requested admin access." });
    }

    user.IsPendingAdmin = false;
    _context.Users.Update(user);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Admin access rejected successfully." });
  }

  [HttpGet("{userId}")]
  [Authorize]
  public async Task<IActionResult> GetUser(int userId)
  {
    UserModel? user = await _context.Users
      .Include(u => u.ShoppingCart)
        .ThenInclude(sh => sh.Items)
          .ThenInclude(i => i.ProductVariant)
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

  [HttpGet("{userId}/orders")]
  [Authorize]
  public async Task<IActionResult> GetUserOrders(int userId)
  {
    UserModel? user = await _context.Users
      .Include(u => u.Orders)
      .ThenInclude(o => o.OrderItems)
      .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null)
    {
      return NotFound(new { message = $"User with id {userId} does not exist." });
    }

    return Ok(user.Orders);
  }

  [HttpGet("me")]
  [Authorize]
  [ServiceFilter(typeof(VerifyUserExistsAttribute))]
  public IActionResult GetMe()
  {
    UserModel? user = (UserModel)HttpContext.Items["user"]!;
    return Ok(user);
  }

  [HttpPut("{userId}")]
  [Authorize]
  public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequest req)
  {
    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
    {
        return Unauthorized();
    }

    // Allow admin to update any user, otherwise restrict to self-update
    if (User.IsInRole(UserRole.Admin.ToString()) == false && authenticatedUserId != userId)
    {
        return Forbid();
    }

    UserModel? userToUpdate = await _context.Users.FindAsync(userId);
    if (userToUpdate == null)
    {
      return NotFound(new { message = $"User with id {userId} not found." });
    }

    if (!string.IsNullOrEmpty(req.Email) && req.Email != userToUpdate.Email)
    {
        bool emailExists = await _context.Users.AnyAsync(u => u.Email == req.Email);
        if (emailExists)
        {
            return BadRequest(new { message = "Email already in use." });
        }
        userToUpdate.Email = req.Email;
    }

    if (!string.IsNullOrEmpty(req.FirstName))
    {
        userToUpdate.FirstName = req.FirstName;
    }

    if (!string.IsNullOrEmpty(req.LastName))
    {
        userToUpdate.LastName = req.LastName;
    }

    if (!string.IsNullOrEmpty(req.Password))
    {
        userToUpdate.PasswordHash = req.Password;
    }

    try
    {
      await _context.SaveChangesAsync();
      return Ok(userToUpdate);
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error updating user: {e}");
      return StatusCode(
          StatusCodes.Status500InternalServerError,
          new { message = "An unexpected problem occurred while updating the user." }
      );
    }
  }

  [HttpDelete("{userId}")]
  [Authorize]
  public async Task<IActionResult> DeleteUser(int userId)
  {
    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId) || authenticatedUserId != userId)
    {
        return Forbid();
    }

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

  [HttpGet("pending-admin-requests")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetPendingAdminRequests()
  {
    List<UserModel> pendingUsers = await _context.Users
        .Where(u => u.IsPendingAdmin == true)
        .ToListAsync();

    return Ok(pendingUsers);
  }
}
