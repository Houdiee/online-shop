using Api.Data;
using Api.Dtos.Product;
using Api.Dtos.Products;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(ApiDbContext context) : ControllerBase
{
  private readonly ApiDbContext _context = context;

  [HttpPost]
  public async Task<IActionResult> CreateNewProduct([FromBody] CreateProductRequest req)
  {
    ProductModel newProduct = new()
    {
      Name = req.Name,
      Description = req.Description,
      Tags = req.Tags,
      Variants = req.Variants.Select(v => new ProductVariantModel
      {
        ParentProductName = req.Name,
        Name = v.Name,
        Price = v.Price,
        StockQuantity = v.StockQuantity,
        DiscountedPrice = v.DiscountedPrice,
        PhotoUrls = [],
        CreatedAt = DateTime.UtcNow,
      }).ToList(),
      CreatedAt = DateTime.UtcNow,
    };

    _ = await _context.Products.AddAsync(newProduct);

    try
    {
      _ = await _context.SaveChangesAsync();
      return Ok(newProduct);
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e}");
      return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to create new product" });
    }
  }

  [HttpPut("{productId}")]
  public async Task<IActionResult> UpdateProduct(int productId, [FromBody] UpdateProductRequest req)
  {
    ProductModel? product = await _context.Products
        .Include(p => p.Variants)
        .FirstOrDefaultAsync(p => p.Id == productId);

    if (product == null)
    {
      return NotFound(new { message = $"Product with id {productId} not found" });
    }

    product.Name = req.Name;
    product.Description = req.Description;
    product.Tags = req.Tags;

    var incomingVariantIds = req.Variants.Where(v => v.Id.HasValue).Select(v => v.Id!.Value).ToList();

    var variantsToRemove = product.Variants.Where(v => !incomingVariantIds.Contains(v.Id)).ToList();
    _context.ProductVariants.RemoveRange(variantsToRemove);

    foreach (var incomingVariant in req.Variants)
    {
      if (incomingVariant.Id.HasValue)
      {
        var existingVariant = product.Variants.FirstOrDefault(v => v.Id == incomingVariant.Id.Value);
        if (existingVariant != null)
        {
          existingVariant.Name = incomingVariant.Name;
          existingVariant.Price = incomingVariant.Price;
          existingVariant.DiscountedPrice = incomingVariant.DiscountedPrice;
          existingVariant.StockQuantity = incomingVariant.StockQuantity;
        }
      }
      else
      {
        var newVariant = new ProductVariantModel
        {
          ParentProductName = product.Name,
          Name = incomingVariant.Name,
          Price = incomingVariant.Price,
          DiscountedPrice = incomingVariant.DiscountedPrice,
          StockQuantity = incomingVariant.StockQuantity,
          PhotoUrls = [],
          CreatedAt = DateTime.UtcNow,
        };
        product.Variants.Add(newVariant);
      }
    }

    try
    {
      await _context.SaveChangesAsync();
      return Ok(product);
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e}");
      return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to update product" });
    }
  }

  // 💡 New endpoint to delete a product and its images
  [HttpDelete("{productId}")]
  public async Task<IActionResult> DeleteProduct(int productId)
  {
    ProductModel? product = await _context.Products
        .Include(p => p.Variants) // 💡 Include variants to access image URLs
        .FirstOrDefaultAsync(p => p.Id == productId);

    if (product == null)
    {
      return NotFound(new { message = $"Product with id {productId} not found" });
    }

    // Delete all images associated with the product's variants
    foreach (var variant in product.Variants)
    {
      foreach (var relativeUrl in variant.PhotoUrls)
      {
        string fileName = Path.GetFileName(relativeUrl);
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

        if (System.IO.File.Exists(filePath))
        {
          try
          {
            System.IO.File.Delete(filePath);
          }
          catch (IOException e)
          {
            Console.WriteLine($"Error deleting image file {filePath}: {e}");
            // Continue even if a file can't be deleted to clean up the rest
          }
        }
      }
    }

    // Remove the product from the database
    _context.Products.Remove(product);

    try
    {
      await _context.SaveChangesAsync();
      return Ok(new { message = "Product and associated images deleted successfully" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error deleting product: {e}");
      return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to delete product" });
    }
  }

  [HttpGet("{productId}")]
  public async Task<IActionResult> GetProductById(int productId)
  {
    ProductModel? product = await _context.Products
        .Include(static p => p.Variants)
        .FirstOrDefaultAsync(p => p.Id == productId);

    if (product == null)
    {
      return BadRequest(new { message = $"Product with id {productId} not found" });
    }

    string baseUrl = $"{Request.Scheme}://{Request.Host}";
    foreach (var variant in product.Variants)
    {
      variant.PhotoUrls = variant.PhotoUrls.Select(url => baseUrl + url).ToList();
    }

    return Ok(product);
  }

  [HttpGet]
  public async Task<IActionResult> GetProductsByQuery(
      [FromQuery] string? search = null,
      [FromQuery] string? tags = null,
      [FromQuery] string? sortBy = null)
  {
    IQueryable<ProductModel> query = _context.Products.Include(static p => p.Variants);

    if (!string.IsNullOrEmpty(search))
    {
      query = query.Where(p => p.Name.Contains(search));
    }

    if (!string.IsNullOrEmpty(tags))
    {
      query = query.Where(p => p.Tags.Contains(tags));
    }

    if (!string.IsNullOrEmpty(sortBy))
    {
      query = sortBy switch
      {
        "priceAsc" => query.OrderBy(p => p.Variants.FirstOrDefault()!.Price),
        "priceDesc" => query.OrderByDescending(p => p.Variants.FirstOrDefault()!.Price),
        "alphabeticalAsc" => query.OrderBy(p => p.Name),
        "alphabeticalDesc" => query.OrderByDescending(p => p.Name),
        "newest" => query.OrderByDescending(p => p.CreatedAt),
        "oldest" => query.OrderBy(p => p.CreatedAt),
        _ => query.OrderByDescending(p => p.CreatedAt),
      };
    }

    List<ProductModel> products = await query.ToListAsync();

    return Ok(products);
  }

  [HttpPut("images/{variantId}")]
  public async Task<IActionResult> ReplaceVariantImages(int variantId, IFormFileCollection files)
  {
    ProductVariantModel? variant = await _context.ProductVariants.FindAsync(variantId);
    if (variant == null)
    {
      return BadRequest(new { message = $"Variant with id {variantId} not found" });
    }

    // Clear the old image URLs from the list
    variant.PhotoUrls.Clear();

    string uploadDirectoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

    if (!Directory.Exists(uploadDirectoryPath))
    {
      _ = Directory.CreateDirectory(uploadDirectoryPath);
    }

    List<string> uploadedPhotoUrls = [];
    string[] allowedExtensions = [".jpg", ".jpeg", ".png"];

    foreach (IFormFile file in files)
    {
      string fileExtension = Path.GetExtension(file.FileName);

      if (!allowedExtensions.Contains(fileExtension))
      {
        return BadRequest(new { message = "File type not supported" });
      }

      string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
      string fileDestinationPath = Path.Combine(uploadDirectoryPath, uniqueFileName);

      try
      {
        using FileStream stream = new(fileDestinationPath, FileMode.Create);
        await file.CopyToAsync(stream);

        string uploadedRelativePath = $"/images/{uniqueFileName}";
        uploadedPhotoUrls.Add(uploadedRelativePath);
      }
      catch (Exception e)
      {
        Console.WriteLine($"Error: {e}");
        return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"Failed to upload file {file.FileName}" });
      }
    }

    foreach (string url in uploadedPhotoUrls)
    {
      variant.PhotoUrls.Add(url);
    }

    try
    {
      _ = await _context.SaveChangesAsync();
      return Ok(variant);
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e}");
      return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected problem occurred" });
    }
  }

  [HttpDelete("images/{variantId}/{fileName}")]
  public async Task<IActionResult> DeleteVariantImage(int variantId, string fileName)
  {
    ProductVariantModel? variant = await _context.ProductVariants.FindAsync(variantId);
    if (variant == null)
    {
      return NotFound(new { message = $"Variant with id {variantId} not found" });
    }

    string relativeUrlToRemove = $"/images/{fileName}";
    bool wasRemoved = variant.PhotoUrls.Remove(relativeUrlToRemove);

    if (!wasRemoved)
    {
      return NotFound(new { message = $"Image with file name {fileName} not found for this variant" });
    }

    string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);
    if (System.IO.File.Exists(filePath))
    {
      System.IO.File.Delete(filePath);
    }

    try
    {
      await _context.SaveChangesAsync();
      return Ok(new { message = "Image deleted successfully" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error deleting image: {e}");
      return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to delete image" });
    }
  }

  [HttpGet("variant/{variantId}")]
  public async Task<IActionResult> GetVariantById(int variantId)
  {
    ProductVariantModel? variant = await _context.ProductVariants.FindAsync(variantId);

    if (variant == null)
    {
      return BadRequest(new { message = $"Variant with id {variantId} not found" });
    }

    return Ok(variant);
  }
}
