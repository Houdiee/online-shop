using System.Text.Json.Serialization;

namespace Api.Models;

public class ProductModel
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required ICollection<string> Tags { get; set; }

    public required ICollection<ProductVariantModel> Variants { get; set; }
}

public class ProductVariantModel
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required decimal Price { get; set; }

    public decimal? DiscountedPrice { get; set; }

    public required int StockQuantity { get; set; }

    public required ICollection<string> PhotoUrls { get; set; }

    // Navigation
    [JsonIgnore]
    public int ProductId { get; set; }

    [JsonIgnore]
    public ProductModel? Product { get; set; }
}
