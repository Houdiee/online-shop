using System.Text.Json.Serialization;

namespace Api.Models;

public class ShoppingCartItemModel
{
  public int Id { get; set; }

  public required int Quantity { get; set; }

  [JsonIgnore]
  public int ShoppingCartId { get; set; }
  [JsonIgnore]
  public ShoppingCartModel ShoppingCart { get; set; } = null!;

  public int ProductVariantId { get; set; }
  public ProductVariantModel ProductVariant { get; set; } = null!;
}
