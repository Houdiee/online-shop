namespace Api.Dtos.Product;

public class UpdateProductRequest
{
  public required string Name { get; set; }
  public required string? Description { get; set; }
  public required List<string> Tags { get; set; }
  public required List<UpdateProductVariantRequest> Variants { get; set; }
}

public class UpdateProductVariantRequest
{
  public int? Id { get; set; }
  public required string Name { get; set; }
  public required decimal Price { get; set; }
  public required decimal? DiscountedPrice { get; set; }
  public required int StockQuantity { get; set; }
}
