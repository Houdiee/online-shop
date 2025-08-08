export type Order = {
  id: number;
  orderItems: Array<{
    id: number;
    productNameAtOrder: string;
    variantNameAtOrder: string;
    quantity: number;
    priceAtOrder: number;
  }>;
  totalCost: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  stripePaymentIntentId: string;
  stripeCheckoutSessionId: string;
  orderedAt: Date;
}
