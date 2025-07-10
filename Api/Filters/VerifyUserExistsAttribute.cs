using Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Api.Filters;

public class ValidateUserExistsAttribute(ApiDbContext context) : IAsyncActionFilter
{
  private readonly ApiDbContext _context = context;

  public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
  {
    if (context.ActionArguments.TryGetValue("userId", out var userIdObj) && userIdObj is int userId)
    {
      var userExists = await _context.Users.AnyAsync(u => u.Id == userId);

      if (!userExists)
      {
        context.Result = new NotFoundObjectResult($"User with ID {userId} not found.");
        return;
      }
    }

    await next();
  }
}
