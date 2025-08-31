using FluentValidation;

namespace Api.Dtos.Products;

public class CreateVariantRequest
{
    public required string Name { get; set; }

    public required decimal Price { get; set; }

    public decimal? DiscountedPrice { get; set; }

    public required int StockQuantity { get; set; }
}

public class CreateVariantRequestValidator : AbstractValidator<CreateVariantRequest>
{
    public CreateVariantRequestValidator()
    {
        // 1. Name validation
        RuleFor(static variant => variant.Name)
            .NotEmpty().WithMessage("Variant name cannot be empty.")
            .NotNull().WithMessage("Variant name cannot be null.")
            .MaximumLength(256).WithMessage("Variant name is too long. Maximum of 256 characters allowed.");

        // 2. Price validation
        RuleFor(static variant => variant.Price)
            .NotNull().WithMessage("Price cannot be null.")
            .GreaterThan(0).WithMessage("Price must be greater than 0.")
            .PrecisionScale(18, 2, ignoreTrailingZeros: true).WithMessage("Price must be a valid currency value with up to two decimal places.");

        // 3. StockQuantity validation
        RuleFor(static variant => variant.StockQuantity)
            .NotNull().WithMessage("Stock quantity cannot be null.")
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        // 4. DiscountedPrice validation
        RuleFor(static variant => variant.DiscountedPrice)
            .PrecisionScale(18, 2, ignoreTrailingZeros: true)
            .When(x => x.DiscountedPrice.HasValue)
            .WithMessage("Discounted price must be a valid currency value with up to two decimal places.");

        RuleFor(static variant => variant.DiscountedPrice)
            .LessThan(static variant => variant.Price)
            .When(static variant => variant.DiscountedPrice.HasValue)
            .WithMessage("Discounted price must be less than the regular price.");
    }
}
