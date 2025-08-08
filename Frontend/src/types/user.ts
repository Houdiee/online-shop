import type { Order } from "./order";
import type { ShoppingCart } from "./shopping-cart";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
  shoppingCart: ShoppingCart;
  orders: Order[];
};
