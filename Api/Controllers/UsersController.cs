using Api.Data;
using Api.Dtos.User;
using Api.Models;
using Api.Services.User;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(ApiDbContext context, UserService userService) : ControllerBase
{
  private readonly ApiDbContext _context = context;
  private readonly UserService _userService = userService;

  public async Task<IActionResult> CreateNewUser([FromBody] CreateUserRequest req)
  {
    CreateUserResult creationResult = await _userService.CreateUserAsync(req);

    if (!creationResult.IsSuccess)
    {
      return BadRequest(new { message = creationResult.Errors });
    }

    return Ok();
  }

  [HttpDelete("{userId}")]
  public async Task<IActionResult> DeleteUser(int userId)
  {
    UserModel? user = await _context.Users.FindAsync(userId);

    if (user == null)
    {
      return BadRequest(new { message = $"User with id {userId} does not exist" });
    }

    _ = _context.Users.Remove(user);

    try
    {
      await _context.SaveChangesAsync();
      return Ok(new { message = $"User with id {userId} deleted successfully" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e}");
      return StatusCode(
        StatusCodes.Status500InternalServerError,
        new { message = "An unexpected problem occurred" }
      );
    }
  }
}

