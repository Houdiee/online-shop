namespace Api.Dtos.Products;

public class CreateVariantRequest
{
    public required string Name { get; set; }

    public required decimal Price { get; set; }

    public decimal? DiscountedPrice { get; set; }

    public required int StockQuantity { get; set; }
}
