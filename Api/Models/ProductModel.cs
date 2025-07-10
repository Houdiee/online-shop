namespace Api.Models;

public class ProductModel
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required ICollection<string> Tags { get; set; }

    public required ICollection<ProductVariantModel> Variants { get; set; }

    public required DateTime CreatedAt { get; set; }
}

