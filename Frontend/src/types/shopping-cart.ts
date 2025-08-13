import type { ProductVariant } from "./product";

export type AddShoppingCartItemRequest = {
  productVariantId: number;
  quantity: number;
};

export type ShoppingCart = {
  id: number;
  items: Array<{
    id: number;
    productVariantId: number;
    productVariant: ProductVariant;
    quantity: number;
  }>;
  totalCost: number;
};

export type UpdateCartItemQuantity = {
  quantity: number;
};
