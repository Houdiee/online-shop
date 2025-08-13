using Microsoft.EntityFrameworkCore;
using Api.Models;
using Api.Data;
using Api.Dtos.ShoppingCart;
using Microsoft.AspNetCore.Mvc;
using Api.Filters;

namespace Api.Controllers;

[ApiController]
[Route("users/{userId}/[controller]")]
[TypeFilter(typeof(VerifyUserExistsAttribute))]
public class ShoppingCartController(ApiDbContext context) : ControllerBase
{
    private readonly ApiDbContext _context = context;

    [HttpPost]
    public async Task<IActionResult> AddItemToShoppingCart(int userId, [FromBody] AddShoppingCartItemRequest request)
    {
        ProductVariantModel? productVariant = await _context.ProductVariants
            .Include(pv => pv.Product)
            .FirstOrDefaultAsync(pv => pv.Id == request.ProductVariantId);

        if (productVariant == null)
        {
            return NotFound($"Product variant with ID {request.ProductVariantId} not found.");
        }

        ShoppingCartModel? shoppingCart = await _context.ShoppingCarts
            .Include(sc => sc.Items)
            .FirstOrDefaultAsync(sc => sc.UserId == userId);

        if (shoppingCart == null)
        {
            shoppingCart = new ShoppingCartModel
            {
                UserId = userId,
                Items = [],
            };
            _context.ShoppingCarts.Add(shoppingCart);
        }

        ShoppingCartItemModel? existingCartItem = shoppingCart.Items
            .FirstOrDefault(item => item.ProductVariantId == request.ProductVariantId);

        if (existingCartItem != null)
        {
            existingCartItem.Quantity += request.Quantity;
        }
        else
        {
            ShoppingCartItemModel newCartItem = new()
            {
                ProductVariantId = request.ProductVariantId,
                ProductVariant = productVariant,
                Quantity = request.Quantity,
                ShoppingCartId = shoppingCart.Id
            };
            shoppingCart.Items.Add(newCartItem);
        }

        _context.ShoppingCarts.Update(shoppingCart);
        await _context.SaveChangesAsync();

        await UpdateTotalCost(shoppingCart.Id);

        ShoppingCartModel? updatedShoppingCart = await _context.ShoppingCarts
            .Include(sc => sc.Items)
            .ThenInclude(sci => sci.ProductVariant)
            .FirstOrDefaultAsync(sc => sc.UserId == userId);

        return Ok(updatedShoppingCart);
    }

    private async Task UpdateTotalCost(int shoppingCartId)
    {
        ShoppingCartModel? shoppingCart = await _context.ShoppingCarts
            .Include(sc => sc.Items)
            .ThenInclude(sci => sci.ProductVariant)
            .FirstOrDefaultAsync(sc => sc.Id == shoppingCartId);

        if (shoppingCart != null)
        {
            shoppingCart.TotalCost = 0;
            foreach (var item in shoppingCart.Items)
            {
                shoppingCart.TotalCost += item.Quantity * (item.ProductVariant.DiscountedPrice ?? item.ProductVariant.Price);
            }
            await _context.SaveChangesAsync();
        }
    }

    [HttpDelete("{shoppingCartItemId}")]
    public async Task<IActionResult> DeleteItemFromShoppingCart(int userId, int shoppingCartItemId)
    {
        ShoppingCartItemModel? itemToRemove = await _context.ShoppingCartItems
            .Include(sci => sci.ShoppingCart)
            .FirstOrDefaultAsync(item =>
                item.Id == shoppingCartItemId &&
                item.ShoppingCart.UserId == userId);

        if (itemToRemove == null)
        {
            return NotFound($"Shopping cart item with ID {shoppingCartItemId} not found in user's cart or for user ID {userId}.");
        }

        try
        {
            _context.ShoppingCartItems.Remove(itemToRemove);
            await _context.SaveChangesAsync();

            await UpdateTotalCost(itemToRemove.ShoppingCartId);

            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Error: {ex}");
            return StatusCode(500, "An error occurred while deleting the item from the database.");
        }
    }

    [HttpPatch("{shoppingCartItemId}")]
    public async Task<IActionResult> UpdateItemQuantity(
        int userId,
        int shoppingCartItemId,
        [FromBody] UpdateCartItemQuantityRequest request)
    {
        ShoppingCartItemModel? itemToUpdate = await _context.ShoppingCartItems
            .Include(sci => sci.ShoppingCart)
            .FirstOrDefaultAsync(item =>
                item.Id == shoppingCartItemId &&
                item.ShoppingCart.UserId == userId);

        if (itemToUpdate == null)
        {
            return NotFound($"Shopping cart item with ID {shoppingCartItemId} not found in user's cart");
        }

        itemToUpdate.Quantity = request.Quantity;

        try
        {
            _context.ShoppingCartItems.Update(itemToUpdate);
            await _context.SaveChangesAsync();

            await UpdateTotalCost(itemToUpdate.ShoppingCartId);

            ShoppingCartModel? updatedShoppingCart = await _context.ShoppingCarts
                .Include(sc => sc.Items)
                .ThenInclude(sci => sci.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .FirstOrDefaultAsync(sc => sc.Id == itemToUpdate.ShoppingCartId);

            if (updatedShoppingCart == null)
            {
                return NotFound("Updated shopping cart could not be found.");
            }

            return Ok(updatedShoppingCart);
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Error: {ex}");
            return StatusCode(500, "An error occurred while updating the item quantity from the database.");
        }
    }
}
