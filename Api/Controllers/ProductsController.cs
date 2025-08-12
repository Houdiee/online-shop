using Api.Data;
using Api.Dtos.Products;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

  [HttpPost("images/{variantId}")]
  public async Task<IActionResult> UploadVariantImages(int variantId, IFormFileCollection files)
  {
    ProductVariantModel? variant = await _context.ProductVariants.FindAsync(variantId);
    if (variant == null)
    {
      return BadRequest(new { message = $"Variant with id {variantId} not found" });
    }
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
