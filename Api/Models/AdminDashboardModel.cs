namespace Api.Models;

public class AdminDashboardModel
{
    public int ProductsSoldLast24Hours { get; set; }
    public int ProductsSoldLast7Days { get; set; }
    public int ProductsSoldLast30Days { get; set; }

    public decimal TotalRevenueLast24Hours { get; set; }
    public decimal TotalRevenueLast7Days { get; set; }
    public decimal TotalRevenueLast30Days { get; set; }

    public decimal AverageOrderValue { get; set; }

    public int PendingOrders { get; set; }
    public int CompletedOrdersLast30Days { get; set; }

    public int TotalRegisteredUsers { get; set; }
    public int NewUsersLast24Hours { get; set; }
    public int NewUsersLast7Days { get; set; }
    public int NewUsersLast30Days { get; set; }

    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public int TotalProducts { get; set; }

    public List<TopProductDto>? TopSellingProductsLast30Days { get; set; }
    public List<string>? TopTagsUsed { get; set; }
    public List<RecentOrderDto>? RecentOrders { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }

    public string? ProductName { get; set; }

    public int QuantitySold { get; set; }

    public decimal RevenueGenerated { get; set; }
}

public class RecentOrderDto
{
    public int OrderId { get; set; }

    public DateTime OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Status { get; set; }

    public string? CustomerName { get; set; }
}
