using Api.Data;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class OrdersController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;
}
