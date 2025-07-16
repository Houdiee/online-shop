using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpGet]
    public async Task<IActionResult> RecentOrders()
    {
        return Ok();
    }
}
