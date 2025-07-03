using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AdminsController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStatistics()
    {
        return Ok();
    }
}
