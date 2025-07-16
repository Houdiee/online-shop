namespace Api.Dtos.Order;

public class CreateCheckoutSessionRequest
{
    public int UserId { get; set; }

    public required int[] VariantIds { get; set; }
}
