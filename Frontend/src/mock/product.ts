import type { Product } from "../types/product";

export const product: Product = {
  id: 1,
  name: "Straps",
  description: null,
  tags: ["fitness", "health", "equipment"],
  variants: [
    { id: 1, name: "Black", imageUrls: ["/straps.png", "/straps_1.png"], price: 12.00, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
    { id: 2, name: "Blue", imageUrls: ["/straps_1.png"], price: 10.00, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
    { id: 3, name: "Red", imageUrls: ["/straps_2.png"], price: 11.50, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
  ],
  createdAt: new Date(),
};
