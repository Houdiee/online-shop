using Api.Data;
using Api.Filters;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class PaymentController(ApiDbContext context, IConfiguration configuration) : ControllerBase
{
    private readonly ApiDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;

    [HttpPost("checkout/{shoppingCartId}")]
    [Authorize]
    [ServiceFilter(typeof(VerifyUserExistsAttribute))]
    public async Task<IActionResult> CreateCheckoutSession(int shoppingCartId)
    {
        UserModel? user = (UserModel)HttpContext.Items["user"]!;

        ShoppingCartModel? shoppingCart = await _context.ShoppingCarts
            .Include(sc => sc.Items)
            .ThenInclude(i => i.ProductVariant)
            .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(sc => sc.Id == shoppingCartId && sc.UserId == user.Id);

        if (shoppingCart is null || shoppingCart.Items.Count == 0)
        {
            return BadRequest(new { message = "Shopping cart is empty or does not belong to the user." });
        }

        List<SessionLineItemOptions> lineItems = [];
        string baseUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}";

        foreach (var item in shoppingCart.Items)
        {
            if (item.ProductVariant == null || item.ProductVariant.Product == null)
            {
                return StatusCode(500, "Error: Product details missing for an item in the cart.");
            }

            List<string> absoluteImageUrls = item.ProductVariant.PhotoUrls.Select(url => $"{baseUrl}{url}").ToList();
            if (absoluteImageUrls.Count == 0)
            {
                absoluteImageUrls.Add($"{baseUrl}/images/placeholder.png");
            }

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"{item.ProductVariant.Product.Name} - {item.ProductVariant.Name}",
                        Images = absoluteImageUrls,
                    },
                    UnitAmount = (long)Math.Round(item.ProductVariant.Price * 100),
                    Currency = "aud",
                },
                Quantity = item.Quantity,
            });
        }

        string frontendUrl = _configuration.GetConnectionString("Frontend")!;

        SessionCreateOptions options = new()
        {
            PaymentMethodTypes = ["card"],
            LineItems = lineItems,
            Mode = "payment",
            SuccessUrl = $"{frontendUrl}/account/orders",
            CancelUrl = $"{frontendUrl}/payment/cancel",
            Metadata = new Dictionary<string, string>
            {
                { "userId", user.Id.ToString() },
                { "shoppingCartId", shoppingCart.Id.ToString() }
            },
            ClientReferenceId = user.Id.ToString(),
        };

        SessionService service = new();
        try
        {
            Session? session = await service.CreateAsync(options);
            return Ok(new { url = session.Url });
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe API Error creating checkout session: {e.Message}");
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { message = "Error communicating with Stripe: " + e.Message }
            );
        }
        catch (Exception e)
        {
            Console.WriteLine($"General Error creating checkout session: {e}");
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { message = "An unexpected problem occurred while creating the checkout session." }
            );
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Index()
    {
        Console.WriteLine($"Webhook triggered at {DateTime.UtcNow}");
        string? json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        string endpointSecret = _configuration["ApiKeys:Stripe:WebhookSecret"]!;

        Event? stripeEvent;
        try
        {
            var signatureHeader = Request.Headers["Stripe-Signature"];
            stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, endpointSecret);
            Console.WriteLine($"Stripe Event Type: {stripeEvent.Type}");
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe webhook signature validation failed: {e.Message}");
            return BadRequest();
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error parsing webhook event: {e.Message}");
            Console.WriteLine(e.StackTrace);
            return StatusCode(StatusCodes.Status500InternalServerError, "Error processing webhook event.");
        }

        if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted)
        {
            return Ok();
        }
        Console.WriteLine("Event type is checkout.session.completed. Proceeding with order creation.");

        Session? session = stripeEvent.Data.Object as Session;
        if (session == null)
        {
            Console.WriteLine("Webhook: Session object is null.");
            return BadRequest(new { message = "Session data missing from event." });
        }

        if (session.PaymentStatus != "paid")
        {
            Console.WriteLine($"Webhook: Session payment status is '{session.PaymentStatus}', not 'paid'. Skipping order creation.");
            return Ok();
        }
        Console.WriteLine($"Webhook: Payment status for session {session.Id} is paid.");

        if (!session.Metadata.TryGetValue("userId", out string? userIdString) ||
            !session.Metadata.TryGetValue("shoppingCartId", out string? shoppingCartIdString))
        {
            Console.WriteLine("Webhook: Missing userId or shoppingCartId in session metadata.");
            return BadRequest("Missing required metadata in Stripe session.");
        }

        if (!int.TryParse(userIdString, out int userId))
        {
            Console.WriteLine($"Webhook: Invalid userId format in metadata: '{userIdString}'");
            return BadRequest("Invalid userId format.");
        }
        if (!int.TryParse(shoppingCartIdString, out int shoppingCartId))
        {
            Console.WriteLine($"Webhook: Invalid shoppingCartId format in metadata: '{shoppingCartIdString}'");
            return BadRequest("Invalid shoppingCartId format.");
        }
        Console.WriteLine($"Webhook: Processing order for User ID: {userId}, Shopping Cart ID: {shoppingCartId}");

        try
        {
            ShoppingCartModel? shoppingCart = await _context.ShoppingCarts
                .Include(sc => sc.Items)
                .ThenInclude(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
                .FirstOrDefaultAsync(sc => sc.Id == shoppingCartId && sc.UserId == userId);

            if (shoppingCart is null || shoppingCart.Items.Count == 0)
            {
                Console.WriteLine($"Webhook Warning: Shopping cart {shoppingCartId} not found or empty for user {userId}. Order might have been processed already or cart cleared prematurely.");
                return Ok();
            }
            Console.WriteLine($"Webhook: Found shopping cart {shoppingCart.Id} with {shoppingCart.Items.Count} items.");

            bool orderExists = await _context.Orders.AnyAsync(o => o.StripeCheckoutSessionId == session.Id);
            if (orderExists)
            {
                Console.WriteLine($"Webhook: Order for Stripe Session ID {session.Id} already exists. Skipping duplicate creation.");
                return Ok();
            }

            OrderModel newOrder = new()
            {
                UserId = userId,
                OrderedAt = DateTime.UtcNow,
                Status = OrderStatus.Completed,
                StripeCheckoutSessionId = session.Id,
                StripePaymentIntentId = session.PaymentIntentId,
                TotalCost = shoppingCart.Items.Sum(i => i.ProductVariant?.Price * i.Quantity ?? 0),
                OrderItems = []
            };

            foreach (var item in shoppingCart.Items)
            {
                if (item.ProductVariant == null || item.ProductVariant.Product == null)
                {
                    Console.WriteLine($"Webhook Error: ProductVariant or Product is null for cart item ID: {item.Id}. Cannot create order item.");
                    continue;
                }

                // Subtract stock quantity
                item.ProductVariant.StockQuantity -= item.Quantity;

                newOrder.OrderItems.Add(new OrderItemModel
                {
                    ProductVariantId = item.ProductVariantId,
                    ProductNameAtOrder = item.ProductVariant.Product.Name,
                    VariantNameAtOrder = item.ProductVariant.Name,
                    Quantity = item.Quantity,
                    PriceAtOrder = item.ProductVariant.Price,
                });
            }

            _context.Orders.Add(newOrder);

            _context.ShoppingCartItems.RemoveRange(shoppingCart.Items);

            await _context.SaveChangesAsync();
            Console.WriteLine($"Order {newOrder.Id} successfully created for user {newOrder.UserId}. Shopping cart {shoppingCart.Id} items cleared.");
            return Ok();
        }
        catch (DbUpdateException dbEx)
        {
            Console.WriteLine($"Webhook DbUpdateException: {dbEx.Message}");
            Console.WriteLine($"Inner Exception: {dbEx.InnerException?.Message}");
            Console.WriteLine($"Stack Trace: {dbEx.StackTrace}");
            return StatusCode(StatusCodes.Status500InternalServerError, "Database update failed during order creation.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Webhook General Exception: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred during webhook processing.");
        }
    }
}
