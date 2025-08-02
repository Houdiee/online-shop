using Microsoft.EntityFrameworkCore;
using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("tags")]
public class TagsController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAllTags()
    {
        List<string> tags = await _context.Products
            .SelectMany(p => p.Tags)
            .Distinct()
            .ToListAsync();

        return Ok(tags);
    }
}
