using Api.Data;
using Api.Dtos.User;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        UserModel? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null)
        {
            return BadRequest(new { message = $"User with email {req.Email} not found" });
        }

        if (user.PasswordHash != req.Password)
        {
            return BadRequest(new { message = "Incorrect password" });
        }

        return Ok(user);
    }
}
