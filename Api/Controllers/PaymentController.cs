using Api.Data;
using Api.Dtos.Order;
using Api.Filters;
using Api.Models;
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

    [HttpPost("checkout")]
    [ServiceFilter(typeof(VerifyUserExistsAttribute))]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest request)
    {
        UserModel? user = (UserModel)HttpContext.Items["user"]!;

        List<ProductVariantModel>? variants = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => request.VariantIds.Contains(v.Id))
            .ToListAsync();

        List<SessionLineItemOptions> lineItems = [];

        string baseUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}";

        foreach (var variant in variants)
        {
            List<string> absoluteImageUrls = variant.PhotoUrls.Select(url => $"{baseUrl}{url}").ToList();

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"{variant.Product.Name} - {variant.Name}",
                        Images = absoluteImageUrls,
                    },
                    UnitAmount = (long)Math.Round(variant.Price * 100),
                    Currency = "aud",
                },
                Quantity = 1,
            });
        }

        SessionCreateOptions options = new()
        {
            PaymentMethodTypes = ["card"],
            LineItems = lineItems,
            Mode = "payment",
            SuccessUrl = $"{baseUrl}/payment/success",
            CancelUrl = $"{baseUrl}/payment/cancel",
            Metadata = new Dictionary<string, string>
            {
                { "userId", user.Id.ToString() },
                { "variantIds", string.Join(",", variants.Select(v => v.Id)) }
            },
            ClientReferenceId = user.Id.ToString(),
        };

        SessionService service = new();
        try
        {
            Session? session = await service.CreateAsync(options);
            return Redirect(session.Url);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error: {e}");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { message = "An unexpected problem occured" }
            );
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Index()
    {
        string? json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        string endpointSecret = _configuration["ApiKeys:Stripe:WebhookSecret"]!;
        Console.WriteLine("booyah");
        try
        {
            var stripeEvent = EventUtility.ParseEvent(json);
            var signatureHeader = Request.Headers["Stripe-Signature"];

            stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, endpointSecret);

            if (!stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                return BadRequest(new { message = "Invalid stripe event type. Only accepting CheckoutSessionCompleted" });
            }

            Session? session = stripeEvent.Data.Object as Session;
            if (session == null)
            {
                return BadRequest(new { message = "Session does not exist" });
            }

            if (session.PaymentStatus != "paid")
            {
                return BadRequest(new { message = "Payment status must be paid" });
            }

            if (!session.Metadata.TryGetValue("userId", out string? userIdString) ||
                !session.Metadata.TryGetValue("variantIds", out string? variantIdsString))
            {
                return BadRequest("Missing metadata in session");
            }

            if (!int.TryParse(userIdString, out int userId))
            {
                return BadRequest("Invalid userId");
            }

            List<int> variantIds = variantIdsString.Split(',')
                                    .Where(s => int.TryParse(s, out _))
                                    .Select(int.Parse)
                                    .ToList();

            List<ProductVariantModel> orderedVariants = await _context.ProductVariants
                .Include(v => v.Product)
                .Where(v => variantIds.Contains(v.Id))
                .ToListAsync();

            if (orderedVariants.Count == 0)
            {
                return BadRequest("No product variants found.");
            }

            OrderModel newOrder = new()
            {
                UserId = userId,
                OrderedAt = DateTime.UtcNow,
                Status = OrderStatus.Completed,
                StripeCheckoutSessionId = session.Id,
                StripePaymentIntentId = session.PaymentIntent.Id,
                TotalCost = orderedVariants.Sum(v => v.Price),
                OrderItems = []
            };

            foreach (var variant in orderedVariants)
            {
                newOrder.OrderItems.Add(new OrderItemModel
                {
                    ProductVariantId = variant.Id,
                    ProductNameAtOrder = variant.Product.Name,
                    VariantNameAtOrder = variant.Name,
                    Quantity = 1,
                    PriceAtOrder = variant.Price,
                });
            }

            _context.Orders.Add(newOrder);

            try
            {
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e}");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected problem occurred" }
                );
            }
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Error: {e}");
            return BadRequest();
        }
    }
}
