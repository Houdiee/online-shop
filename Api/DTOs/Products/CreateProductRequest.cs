namespace Api.Dtos.Products;

public class CreateProductRequest
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public required ICollection<CreateVariantRequest> Variants { get; set; }
}

