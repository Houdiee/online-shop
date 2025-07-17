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
        if (context.ActionArguments.TryGetValue("shoppingCartId", out var shoppingCartIdObj) && shoppingCartIdObj is int shoppingCartId)
        {
            var shoppingCart = await _context.ShoppingCarts.FirstOrDefaultAsync(sc => sc.Id == shoppingCartId);

            if (shoppingCart is null)
            {
                context.Result = new NotFoundObjectResult($"Shopping cart with ID {shoppingCartId} not found.");
                return;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == shoppingCart.UserId);

            if (user is null)
            {
                context.Result = new NotFoundObjectResult($"User with ID {shoppingCart.UserId} not found.");
                return;
            }

            context.HttpContext.Items["user"] = user;
        }

        await next();
    }
}
