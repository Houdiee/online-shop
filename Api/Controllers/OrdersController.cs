using Api.Models;
using Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpGet]
    public async Task<IActionResult> RecentOrders(
        [FromQuery] int fromRow = 0,
        [FromQuery] int toRow = 15
    )
    {
        if (fromRow < 0 || fromRow > toRow)
        {
            return BadRequest(new { messsage = "Invalid query params for rows" });
        }

        int takeAmount = toRow - fromRow;
        const int maxTakeAmount = 100;

        if (takeAmount > maxTakeAmount)
        {
            return BadRequest(new { message = $"Take amount cannot exceed ${takeAmount}" });
        }

        List<OrderModel> recentOrders = await _context.Orders
            .Include(o => o.OrderItems)
            .Skip(fromRow)
            .Take(takeAmount)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        return Ok(recentOrders);
    }
}
