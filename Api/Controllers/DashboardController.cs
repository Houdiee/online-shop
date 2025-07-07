using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("admins/[controller]")]
public class DashboardController(ApiDbContext context) : ControllerBase
{
  private readonly ApiDbContext _context = context;

  [HttpGet]
  public async Task<IActionResult> GetDashboardStatistics()
  {
    DateTime now = DateTime.UtcNow;
    DateTime yesterday = now.AddHours(-24);
    DateTime sevenDaysAgo = now.AddDays(-7);
    DateTime thirtyDaysAgo = now.AddDays(-30);

    int productsSoldLast24Hours = await _context
        .Orders
        .CountAsync(ords => ords.OrderedAt >= yesterday && ords.Status == OrderStatus.Completed);

    int productsSoldLast7Days = await _context
        .Orders
        .CountAsync(ords => ords.OrderedAt >= sevenDaysAgo && ords.Status == OrderStatus.Completed);

    int productsSoldLast30Days = await _context
        .Orders
        .CountAsync(ords => ords.OrderedAt >= thirtyDaysAgo && ords.Status == OrderStatus.Completed);


    var salesDataFromDb = await _context.Orders
           .Where(ords => ords.OrderedAt >= thirtyDaysAgo && ords.Status == OrderStatus.Completed)
           .GroupBy(ords => ords.OrderedAt.Date)
           .Select(group => new { Date = group.Key, TotalSales = group.Sum(ords => ords.TotalCost) })
           .ToDictionaryAsync(s => s.Date, s => s.TotalSales);

    List<(DateTime, decimal)> salesLast30DaysDaily = [];

    for (int i = 0; i < 30; i++)
    {
      DateTime currentDate = thirtyDaysAgo.AddDays(i).Date;
      decimal salesForDay = 0;

      if (salesDataFromDb.TryGetValue(currentDate, out decimal sales))
      {
        salesForDay = sales;
      }

      salesLast30DaysDaily.Add((currentDate, salesForDay));
    }


    decimal totalRevenueLast24Hours = await _context
        .Orders
        .Where(ords => ords.OrderedAt >= yesterday && ords.Status == OrderStatus.Completed)
        .SumAsync(o => o.TotalCost);

    decimal totalRevenueLast7Days = await _context
        .Orders
        .Where(ords => ords.OrderedAt >= sevenDaysAgo && ords.Status == OrderStatus.Completed)
        .SumAsync(o => o.TotalCost);

    decimal totalRevenueLast30Days = await _context
        .Orders
        .Where(ords => ords.OrderedAt >= thirtyDaysAgo && ords.Status == OrderStatus.Completed)
        .SumAsync(o => o.TotalCost);


    int pendingOrders = await _context.Orders
        .CountAsync(ords => ords.Status == OrderStatus.Pending);

    int completedOrdersLast24Hours = await _context.Orders
        .CountAsync(ords => ords.OrderedAt >= yesterday && ords.Status == OrderStatus.Completed);

    int completedOrdersLast7Days = await _context.Orders
        .CountAsync(ords => ords.OrderedAt >= sevenDaysAgo && ords.Status == OrderStatus.Completed);

    int completedOrdersLast30Days = await _context.Orders
        .CountAsync(ords => ords.OrderedAt >= thirtyDaysAgo && ords.Status == OrderStatus.Completed);


    int totalRegisteredUsers = await _context.Users.CountAsync();

    int newUsersLast24Hours = await _context.Users
        .CountAsync(u => u.CreatedAt >= yesterday);

    int newUsersLast7Days = await _context.Users
        .CountAsync(u => u.CreatedAt >= sevenDaysAgo);

    int newUsersLast30Days = await _context.Users
        .CountAsync(u => u.CreatedAt >= thirtyDaysAgo);


    int lowStockThreshold = 10;

    List<ProductModel> lowStockProducts = await _context.Products
        .Include(p => p.Variants)
        .Where(p => p.Variants.Any(pv => pv.StockQuantity > 0 && pv.StockQuantity <= lowStockThreshold))
        .ToListAsync();

    List<ProductModel> outOfStockProducts = await _context.Products
        .Include(p => p.Variants)
        .Where(p => p.Variants.All(pv => pv.StockQuantity == 0))
        .ToListAsync();

    int totalProducts = await _context.Products.CountAsync();

    List<string> topTagsUsed = await _context.Products
        .SelectMany(p => p.Tags)
        .GroupBy(tag => tag)
        .OrderByDescending(g => g.Count())
        .Take(5)
        .Select(g => g.Key)
        .ToListAsync();

    AdminDashboardModel dashboardData = new()
    {
      ProductsSoldLast24Hours = productsSoldLast24Hours,
      ProductsSoldLast7Days = productsSoldLast7Days,
      ProductsSoldLast30Days = productsSoldLast30Days,

      SalesLast30DaysDaily = salesLast30DaysDaily,

      TotalRevenueLast24Hours = totalRevenueLast24Hours,
      TotalRevenueLast7Days = totalRevenueLast7Days,
      TotalRevenueLast30Days = totalRevenueLast30Days,

      PendingOrders = pendingOrders,
      CompletedOrdersLast24Hours = completedOrdersLast24Hours,
      CompletedOrdersLast7Days = completedOrdersLast7Days,
      CompletedOrdersLast30Days = completedOrdersLast30Days,

      TotalRegisteredUsers = totalRegisteredUsers,
      NewUsersLast24Hours = newUsersLast24Hours,
      NewUsersLast7Days = newUsersLast7Days,
      NewUsersLast30Days = newUsersLast30Days,

      LowStockProducts = lowStockProducts,
      OutOfStockProducts = outOfStockProducts,
      TotalProducts = totalProducts,

      TopTagsUsed = topTagsUsed,
    };

    return Ok(dashboardData);
  }
}
