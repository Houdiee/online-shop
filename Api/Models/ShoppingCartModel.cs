using System.Text.Json.Serialization;

namespace Api.Models;

public class ShoppingCartModel
{
    public int Id { get; set; }

    public required ICollection<ShoppingCartItemModel> Items { get; set; }

    [JsonIgnore]
    public required int UserId { get; set; }
    [JsonIgnore]
    public UserModel User { get; set; } = null!;
}

public class ShoppingCartItemModel
{
    public int Id { get; set; }

    public required string ProductVariantName { get; set; }

    public required int Quantity { get; set; }

    [JsonIgnore]
    public required int ShoppingCartId { get; set; }
    [JsonIgnore]
    public ShoppingCartModel ShoppingCart { get; set; } = null!;

    [JsonIgnore]
    public required int ProductVariantId { get; set; }
    [JsonIgnore]
    public ProductVariantModel ProductVariant { get; set; } = null!;
}
