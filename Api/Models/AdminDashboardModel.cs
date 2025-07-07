namespace Api.Models;

public class AdminDashboardModel
{
  public required int ProductsSoldLast24Hours { get; set; }
  public required int ProductsSoldLast7Days { get; set; }
  public required int ProductsSoldLast30Days { get; set; }

  public required List<(DateTime, decimal)> SalesLast30DaysDaily { get; set; }

  public required decimal TotalRevenueLast24Hours { get; set; }
  public required decimal TotalRevenueLast7Days { get; set; }
  public required decimal TotalRevenueLast30Days { get; set; }

  public required int PendingOrders { get; set; }

  public required int CompletedOrdersLast24Hours { get; set; }
  public required int CompletedOrdersLast7Days { get; set; }
  public required int CompletedOrdersLast30Days { get; set; }

  public required int TotalRegisteredUsers { get; set; }
  public required int NewUsersLast24Hours { get; set; }
  public required int NewUsersLast7Days { get; set; }
  public required int NewUsersLast30Days { get; set; }

  public required List<ProductModel> LowStockProducts { get; set; }
  public required List<ProductModel> OutOfStockProducts { get; set; }
  public required int TotalProducts { get; set; }

  public required List<string> TopTagsUsed { get; set; }
}

