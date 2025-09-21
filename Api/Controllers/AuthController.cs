using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Data;
using Api.Dtos.User;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(ApiDbContext context, IConfiguration configuration) : ControllerBase
{
    private readonly ApiDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;

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

        var token = GenerateJwtToken(user);

        return Ok(new { user, token });
    }

    private string GenerateJwtToken(UserModel user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: null,
            audience: null,
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
