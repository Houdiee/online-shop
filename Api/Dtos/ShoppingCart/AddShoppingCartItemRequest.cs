namespace Api.Dtos.ShoppingCart;

public class AddShoppingCartItemRequest
{
  public required int ProductVariantId { get; set; }

  public required int Quantity { get; set; }
}
