using System.Security.Claims;
using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Api.Filters;

public class VerifyUserExistsAttribute(ApiDbContext context) : IAsyncActionFilter
{
    private readonly ApiDbContext _context = context;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userIdClaim = context.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            var user = await _context.Users
                .Include(u => u.ShoppingCart)
                    .ThenInclude(sh => sh.Items)
                        .ThenInclude(i => i.ProductVariant)
                .Include(u => u.Orders)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            { 
                context.Result = new NotFoundObjectResult($"User with ID {userId} not found.");
                return;
            }

            context.HttpContext.Items["user"] = user;
        }

        await next();
    }
}
