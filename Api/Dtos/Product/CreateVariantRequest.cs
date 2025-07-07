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
        _ = RuleFor(static variant => variant.Name)
          .NotNull().WithMessage("variant tag cannot be null")
          .NotEmpty().WithMessage("variant tag cannot be empty")
          .MaximumLength(256).WithMessage("variant tag is too long. Maximum of 256 characters allowed");

        _ = RuleFor(static variant => variant.DiscountedPrice)
          .NotEmpty().WithMessage("variant discounted price cannot be empty")
          .PrecisionScale(
              precision: 18,
              scale: 2,
              ignoreTrailingZeros: true
          ).WithMessage("variant discounted price is invalid");

        _ = RuleFor(static variant => variant.Price)
          .NotNull().WithMessage("variant price cannot be null")
          .NotEmpty().WithMessage("variant price cannot be empty")
          .PrecisionScale(
              precision: 18,
              scale: 2,
              ignoreTrailingZeros: true
          ).WithMessage("variant price is invalid");

        _ = RuleFor(static variant => variant.StockQuantity)
          .NotNull().WithMessage("variant variant cannot be null")
          .NotEmpty().WithMessage("variant variant cannot be empty");
    }
}
