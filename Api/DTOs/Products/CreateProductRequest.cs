using FluentValidation;

namespace Api.Dtos.Products;

public class CreateProductRequest
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public required List<string> Tags { get; set; }

    public required ICollection<CreateVariantRequest> Variants { get; set; }
}

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        _ = RuleFor(static product => product.Name)
          .NotEmpty().WithMessage("Product name cannot be empty")
          .NotNull().WithMessage("Product name cannot be null")
          .MaximumLength(256).WithMessage("Product name is too long. Maximum of 256 characters allowed");

        _ = RuleFor(static product => product.Description)
          .MaximumLength(1000).WithMessage("Product description is too long. Maximum of 1000 characters allowed");

        _ = RuleFor(static product => product.Tags)
          .NotNull().WithMessage("Product tags cannot be null")
          .NotEmpty().WithMessage("Product tags cannot be empty")
          .Must(static tags => tags.Count <= 5).WithMessage("Product tags only allows a maximum of up to 5 total tags");
    }
}
