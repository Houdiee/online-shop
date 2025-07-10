using System.Text.Json.Serialization;

namespace Api.Models;

public class OrderModel
{
    public int Id { get; set; }

    public required ICollection<OrderItemModel> OrderItems { get; set; }

    public required decimal TotalCost { get; set; }

    public required OrderStatus Status { get; set; }

    public required DateTime OrderedAt { get; set; }

    [JsonIgnore]
    public int UserId { get; set; }

    [JsonIgnore]
    public UserModel User { get; set; } = null!;
}

public enum OrderStatus
{
    Pending,
    Shipped,
    Completed,
    Cancelled,
    Refunded,
}
