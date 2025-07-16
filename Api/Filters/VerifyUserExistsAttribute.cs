using Api.Data;
using Api.Dtos.Order;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Api.Filters;

public class VerifyUserExistsAttribute(ApiDbContext context) : IAsyncActionFilter
{
    private readonly ApiDbContext _context = context;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.ActionArguments.TryGetValue("request", out var requestObj) && requestObj is CreateCheckoutSessionRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (user is null)
            {
                context.Result = new NotFoundObjectResult($"User with ID {request.UserId} not found.");
                return;
            }

            context.HttpContext.Items["user"] = user;
        }

        await next();
    }
}
