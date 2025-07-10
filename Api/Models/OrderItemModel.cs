using System.Text.Json.Serialization;

namespace Api.Models;

public class OrderItemModel
{
    public int Id { get; set; }

    public required string ProductNameAtOrder { get; set; }

    public required string VariantNameAtOrder { get; set; }

    public required int Quantity { get; set; }

    public required decimal PriceAtOrder { get; set; }

    [JsonIgnore]
    public int OrderId { get; set; }
    [JsonIgnore]
    public OrderModel Order { get; set; } = null!;

    [JsonIgnore]
    public int ProductVariantId { get; set; }
    [JsonIgnore]
    public ProductVariantModel ProductVariant { get; set; } = null!;
}
