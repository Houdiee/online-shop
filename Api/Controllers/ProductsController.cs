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
            Variants = req.Variants.Select(static v => new ProductVariantModel
            {
                Name = v.Name,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                PhotoUrls = new List<string>(),
            }).ToList(),
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

        return Ok(product);
    }

    [HttpPost("upload/{variantId}")]
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

        foreach (IFormFile file in files)
        {
            string[] allowedExtensions = [".jpg", ".jpeg", ".png"];
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
